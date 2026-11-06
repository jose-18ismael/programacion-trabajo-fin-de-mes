using System;
using System.Collections.Generic;

namespace SistemaAtencionCliente
{
    public class Cliente
    {
        public string Codigo = "";
        public string NombreCompleto = "";
        public int Edad;
        public string TipoServicio = "";
        public string EspecialidadMedica = "";
        public int NumeroTurno;
        public bool Atendido;
    }

    class Program
    {
        const int Capacidad = 20;
        static readonly Cliente[] clientes = new Cliente[Capacidad];
        static readonly Queue<Cliente> cola = new Queue<Cliente>();
        static readonly Stack<string> historial = new Stack<string>();
        static int cantidad, siguienteTurno = 1;

        static void Main(string[] args)
        {
            while (true)
            {
                Menu();
                var entrada = Console.ReadLine();
                if (entrada == null) break;
                int opcion;
                if (!int.TryParse(entrada, out opcion))
                {
                    Console.WriteLine("Ingrese una opción válida.");
                    Pausar();
                    continue;
                }

                switch (opcion)
                {
                    case 1: Registrar(); break;
                    case 2: ListarClientes(); break;
                    case 3: Buscar(); break;
                    case 4: Modificar(); break;
                    case 5: Encolar(); break;
                    case 6: ListarCola(); break;
                    case 7: Atender(); break;
                    case 8: VerProximoTurno(); break;
                    case 9: VerHistorial(); break;
                    case 10: VerUltimaOperacion(); break;
                    case 11: RetirarHistorial(); break;
                    case 12: Estadisticas(); break;
                    case 13: return;
                    default: Console.WriteLine("Opción fuera del menú."); break;
                }
                Pausar();
            }
        }

        static void Menu()
        {
            if (!Console.IsInputRedirected) Console.Clear();
            Console.WriteLine("\nSISTEMA DE ATENCIÓN HOSPITALARIA");
            Console.WriteLine("ARREGLO: 1 Registrar | 2 Listar | 3 Buscar | 4 Modificar");
            Console.WriteLine("COLA FIFO: 5 Encolar | 6 Ver cola | 7 Atender | 8 Próximo (Peek)");
            Console.WriteLine("PILA LIFO: 9 Historial | 10 Último (Peek) | 11 Retirar (Pop)");
            Console.WriteLine("12 Estadísticas | 13 Salir");
            Console.Write("Opción: ");
        }

        static void Registrar()
        {
            if (cantidad == Capacidad)
            {
                Console.WriteLine("Arreglo lleno: máximo 20 pacientes.");
                return;
            }

            string codigo = LeerTexto("Código: ");
            if (Indice(codigo) >= 0) { Console.WriteLine("Ese código ya existe."); return; }
            Cliente paciente = new Cliente
            {
                Codigo = codigo,
                NombreCompleto = LeerTexto("Nombre completo: "),
                Edad = LeerEntero("Edad (1-120): ", 1, 120),
                TipoServicio = LeerServicio(),
                NumeroTurno = siguienteTurno++
            };
            if (paciente.TipoServicio == "Consulta")
                paciente.EspecialidadMedica = LeerTexto("Especialidad médica: ");

            clientes[cantidad++] = paciente;
            Console.WriteLine("Paciente registrado. Turno #{0}.", paciente.NumeroTurno);
        }

        static void ListarClientes()
        {
            if (cantidad == 0) { Console.WriteLine("No hay pacientes registrados."); return; }
            for (int i = 0; i < cantidad; i++) MostrarCliente(clientes[i]);
            Console.WriteLine("Total: {0}/{1}", cantidad, Capacidad);
        }

        static void Buscar()
        {
            int indice = Indice(LeerTexto("Código a buscar: "));
            if (indice < 0) Console.WriteLine("No se encontró ese código.");
            else MostrarCliente(clientes[indice]);
        }

        static void Modificar()
        {
            int indice = Indice(LeerTexto("Código del paciente: "));
            if (indice < 0) { Console.WriteLine("No se encontró ese código."); return; }
            Cliente paciente = clientes[indice];
            paciente.NombreCompleto = LeerTexto("Nuevo nombre: ");
            paciente.Edad = LeerEntero("Nueva edad (1-120): ", 1, 120);
            paciente.TipoServicio = LeerServicio();
            paciente.EspecialidadMedica = paciente.TipoServicio == "Consulta"
                ? LeerTexto("Especialidad médica: ")
                : "";
            MostrarCliente(paciente);
        }

        static void Encolar()
        {
            int indice = Indice(LeerTexto("Código para agregar a la cola: "));
            if (indice < 0) { Console.WriteLine("Registre primero al paciente."); return; }
            Cliente paciente = clientes[indice];
            if (paciente.Atendido) { Console.WriteLine("El paciente ya fue atendido."); return; }
            if (EnCola(paciente.Codigo)) { Console.WriteLine("El paciente ya está en la cola."); return; }
            cola.Enqueue(paciente);
            Console.WriteLine("{0} agregado a la cola.", paciente.NombreCompleto);
        }

        static void ListarCola()
        {
            if (cola.Count == 0) { Console.WriteLine("La cola está vacía."); return; }
            int lugar = 1;
            foreach (Cliente paciente in cola)
                Console.WriteLine("{0}. Turno #{1} | {2} | {3}", lugar++, paciente.NumeroTurno,
                    paciente.NombreCompleto, Servicio(paciente));
            Console.WriteLine("Pendientes: {0}", cola.Count);
        }

        static void Atender()
        {
            if (cola.Count == 0) { Console.WriteLine("La cola está vacía."); return; }
            Cliente paciente = cola.Dequeue();
            paciente.Atendido = true;
            historial.Push(string.Format("Atendido: {0} | Código: {1} | Turno #{2} | {3} | {4}",
                paciente.NombreCompleto, paciente.Codigo, paciente.NumeroTurno, Servicio(paciente),
                DateTime.Now.ToString("dd/MM/yyyy HH:mm")));
            Console.WriteLine("{0} atendido y guardado en el historial.", paciente.NombreCompleto);
        }

        static void VerProximoTurno()
        {
            if (cola.Count == 0) { Console.WriteLine("La cola está vacía."); return; }
            Cliente paciente = cola.Peek();
            Console.WriteLine("Siguiente turno #{0}: {1} ({2}).",
                paciente.NumeroTurno, paciente.NombreCompleto, Servicio(paciente));
        }

        static void VerHistorial()
        {
            if (historial.Count == 0) { Console.WriteLine("El historial está vacío."); return; }
            int lugar = 1;
            foreach (string registro in historial)
                Console.WriteLine("{0}. {1}{2}", lugar, registro, lugar++ == 1 ? " <-- TOPE" : "");
        }

        static void VerUltimaOperacion()
        {
            if (historial.Count == 0) Console.WriteLine("El historial está vacío.");
            else Console.WriteLine("Última operación: {0}", historial.Peek());
        }

        static void RetirarHistorial()
        {
            if (historial.Count == 0) Console.WriteLine("El historial está vacío.");
            else Console.WriteLine("Operación retirada: {0}", historial.Pop());
        }

        static void Estadisticas()
        {
            int atendidos = 0;
            for (int i = 0; i < cantidad; i++)
                if (clientes[i].Atendido) atendidos++;
            Console.WriteLine("Registrados: {0}/{1} | En cola: {2} | Atendidos: {3} | Historial: {4}",
                cantidad, Capacidad, cola.Count, atendidos, historial.Count);
        }

        static int Indice(string codigo)
        {
            for (int i = 0; i < cantidad; i++)
                if (clientes[i].Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase)) return i;
            return -1;
        }

        static bool EnCola(string codigo)
        {
            foreach (Cliente paciente in cola)
                if (paciente.Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }

        static void MostrarCliente(Cliente paciente)
        {
            string estado = paciente.Atendido ? "Atendido" : EnCola(paciente.Codigo) ? "En espera" : "Registrado";
            Console.WriteLine("Código: {0} | Nombre: {1} | Edad: {2} | Servicio: {3} | Turno: #{4} | {5}",
                paciente.Codigo, paciente.NombreCompleto, paciente.Edad, Servicio(paciente),
                paciente.NumeroTurno, estado);
        }

        static string Servicio(Cliente paciente)
        {
            return paciente.TipoServicio == "Consulta" && paciente.EspecialidadMedica != ""
                ? "Consulta - " + paciente.EspecialidadMedica
                : paciente.TipoServicio;
        }

        static string LeerTexto(string mensaje)
        {
            while (true)
            {
                Console.Write(mensaje);
                var texto = Console.ReadLine();
                if (texto == null) return "";
                if (!string.IsNullOrWhiteSpace(texto)) return texto.Trim();
                Console.WriteLine("El campo no puede quedar vacío.");
            }
        }

        static int LeerEntero(string mensaje, int minimo, int maximo)
        {
            int numero;
            while (!int.TryParse(LeerTexto(mensaje), out numero) || numero < minimo || numero > maximo)
                Console.WriteLine("Ingrese un número entre {0} y {1}.", minimo, maximo);
            return numero;
        }

        static string LeerServicio()
        {
            string[] servicios = { "Urgencias", "Consulta", "Laboratorio", "Farmacia", "Atención general" };
            Console.WriteLine("1 Urgencias | 2 Consulta | 3 Laboratorio | 4 Farmacia | 5 Atención general");
            return servicios[LeerEntero("Servicio (1-5): ", 1, servicios.Length) - 1];
        }

        static void Pausar()
        {
            if (!Console.IsInputRedirected)
            {
                Console.WriteLine("\nPresione una tecla para continuar...");
                Console.ReadKey();
            }
        }
    }
}
