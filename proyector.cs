using System;

namespace SistemaAtencionCliente
{
    // Estructura para almacenar los datos del cliente
    public struct Cliente
    {
        public string Codigo;
        public string NombreCompleto;
        public int Edad;
        public string TipoServicio;
        public int NumeroTurno;
    }

    class Program
    {
        // MÓDULO 1: Arreglos (Capacidad para al menos 20 clientes)
        static Cliente[] arregloClientes = new Cliente[20];
        static int contadorClientes = 0;

        // MÓDULO 2: Colas (FIFO - First In, First Out) usando clases nativas simuladas o array/queue
        // Usaremos System.Collections.Generic.Queue para cumplir con las facilidades de C# permitidas
        static System.Collections.Generic.Queue<Cliente> colaEspera = new System.Collections.Generic.Queue<Cliente>();

        // MÓDULO 3: Pilas (LIFO - Last In, First Out) para el historial de atenciones
        static System.Collections.Generic.Stack<string> pilaHistorial = new System.Collections.Generic.Stack<string>();

        static void Main(string[] args)
        {
            int opcion = 0;
            do
            {
                Console.Clear();
                Console.WriteLine("==================================================");
                Console.WriteLine("   SISTEMA DE GESTIÓN DE ATENCIÓN AL CLIENTE      ");
                Console.WriteLine("==================================================");
                Console.WriteLine(" 1. Registrar cliente");
                Console.WriteLine(" 2. Mostrar clientes registrados");
                Console.WriteLine(" 3. Buscar cliente por código");
                Console.WriteLine(" 4. Modificar información de cliente");
                Console.WriteLine(" 5. Encolar cliente (Agregar a fila de espera)");
                Console.WriteLine(" 6. Mostrar lista de espera (Cola)");
                Console.WriteLine(" 7. Atender siguiente cliente (Dequeue)");
                Console.WriteLine(" 8. Consultar próximo turno (Peek cola)");
                Console.WriteLine(" 9. Ver historial de atenciones (Pila)");
                Console.WriteLine("10. Retirar última operación del historial (Pop)");
                Console.WriteLine("11. Ver estadísticas generales");
                Console.WriteLine("12. Salir");
                Console.WriteLine("==================================================");
                Console.Write("Seleccione una opción (1-12): ");

                if (int.TryParse(Console.ReadLine(), out opcion))
                {
                    switch (opcion)
                    {
                        case 1:
                            RegistrarCliente();
                            break;
                        case 2:
                            MostrarClientes();
                            break;
                        case 3:
                            BuscarCliente();
                            break;
                        case 4:
                            ModificarCliente();
                            break;
                        case 5:
                            EncolarCliente();
                            break;
                        case 6:
                            MostrarCola();
                            break;
                        case 7:
                            AtenderCliente();
                            break;
                        case 8:
                            ConsultarProximoTurno();
                            break;
                        case 9:
                            VerHistorial();
                            break;
                        case 10:
                            RetirarHistorial();
                            break;
                        case 11:
                            VerEstadisticas();
                            break;
                        case 12:
                            Console.WriteLine("\n¡Gracias por usar el sistema! Saliendo...");
                            break;
                        default:
                            Console.WriteLine("\nOpción inválida. Intente de nuevo.");
                            break;
                    }
                }
                else
                {
                    Console.WriteLine("\nPor favor, ingrese un número válido.");
                }

                if (opcion != 12)
                {
                    Console.WriteLine("\nPresione cualquier tecla para continuar...");
                    Console.ReadKey();
                }

            } while (opcion != 12);
        }

        // --- MÓDULO 1: ARREGLOS ---

        static void RegistrarCliente()
        {
            Console.Clear();
            Console.WriteLine("--- REGISTRAR NUEVO CLIENTE ---");

            if (contadorClientes >= 20)
            {
                Console.WriteLine("El arreglo de clientes está lleno (máximo 20).");
                return;
            }

            Console.Write("Ingrese código del cliente: ");
            string codigo = Console.ReadLine();

            // Validar duplicados
            for (int i = 0; i < contadorClientes; i++)
            {
                if (arregloClientes[i].Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("Error: Ya existe un cliente registrado con ese código.");
                    return;
                }
            }

            Console.Write("Ingrese nombre completo: ");
            string nombre = Console.ReadLine();

            Console.Write("Ingrese edad: ");
            int edad = int.Parse(Console.ReadLine());

            Console.Write("Ingrese tipo de servicio (Ej. Caja, Créditos, Plataforma): ");
            string servicio = Console.ReadLine();

            int turno = contadorClientes + 1;

            // Guardar en el arreglo
            arregloClientes[contadorClientes] = new Cliente
            {
                Codigo = codigo,
                NombreCompleto = nombre,
                Edad = edad,
                TipoServicio = servicio,
                NumeroTurno = turno
            };

            contadorClientes++;
            Console.WriteLine($"\n¡Cliente registrado con éxito! Su número de turno asignado es: {turno}");
        }

        static void MostrarClientes()
        {
            Console.Clear();
            Console.WriteLine("--- CLIENTES REGISTRADOS EN EL ARREGLO ---");

            if (contadorClientes == 0)
            {
                Console.WriteLine("No hay clientes registrados.");
                return;
            }

            for (int i = 0; i < contadorClientes; i++)
            {
                Console.WriteLine($"[{i + 1}] Código: {arregloClientes[i].Codigo} | Nombre: {arregloClientes[i].NombreCompleto} | Edad: {arregloClientes[i].Edad} | Servicio: {arregloClientes[i].TipoServicio} | Turno: {arregloClientes[i].NumeroTurno}");
            }
            Console.WriteLine($"\nCantidad total de clientes: {contadorClientes} / 20");
        }

        static void BuscarCliente()
        {
            Console.Clear();
            Console.WriteLine("--- BUSCAR CLIENTE POR CÓDIGO ---");
            Console.Write("Ingrese el código a buscar: ");
            string codigo = Console.ReadLine();

            bool encontrado = false;
            for (int i = 0; i < contadorClientes; i++)
            {
                if (arregloClientes[i].Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("\n¡Cliente encontrado!");
                    Console.WriteLine($"Nombre: {arregloClientes[i].NombreCompleto}");
                    Console.WriteLine($"Edad: {arregloClientes[i].Edad}");
                    Console.WriteLine($"Servicio: {arregloClientes[i].TipoServicio}");
                    Console.WriteLine($"Turno: {arregloClientes[i].NumeroTurno}");
                    encontrado = true;
                    break;
                }
            }

            if (!encontrado)
            {
                Console.WriteLine("No se encontró ningún cliente con ese código.");
            }
        }

        static void ModificarCliente()
        {
            Console.Clear();
            Console.WriteLine("--- MODIFICAR INFORMACIÓN DE CLIENTE ---");
            Console.Write("Ingrese el código del cliente a modificar: ");
            string codigo = Console.ReadLine();

            bool encontrado = false;
            for (int i = 0; i < contadorClientes; i++)
            {
                if (arregloClientes[i].Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine($"Cliente actual: {arregloClientes[i].NombreCompleto}");
                    Console.Write("Ingrese nuevo nombre: ");
                    arregloClientes[i].NombreCompleto = Console.ReadLine();

                    Console.Write("Ingrese nueva edad: ");
                    arregloClientes[i].Edad = int.Parse(Console.ReadLine());

                    Console.Write("Ingrese nuevo tipo de servicio: ");
                    arregloClientes[i].TipoServicio = Console.ReadLine();

                    Console.WriteLine("\n¡Información modificada exitosamente!");
                    encontrado = true;
                    break;
                }
            }

            if (!encontrado)
            {
                Console.WriteLine("No se encontró el cliente especificado.");
            }
        }

        // --- MÓDULO 2: COLAS (FIFO) ---

        static void EncolarCliente()
        {
            Console.Clear();
            Console.WriteLine("--- ENCOLAR CLIENTE (AGREGAR A FILA) ---");
            Console.Write("Ingrese el código del cliente registrado que desea pasar a la cola: ");
            string codigo = Console.ReadLine();

            Cliente? clienteEncontrado = null;
            for (int i = 0; i < contadorClientes; i++)
            {
                if (arregloClientes[i].Codigo.Equals(codigo, StringComparison.OrdinalIgnoreCase))
                {
                    clienteEncontrado = arregloClientes[i];
                    break;
                }
            }

            if (clienteEncontrado != null)
            {
                colaEspera.Enqueue(clienteEncontrado.Value);
                Console.WriteLine($"\n¡Cliente {clienteEncontrado.Value.NombreCompleto} agregado a la cola de espera exitosamente (Enqueue)!");
            }
            else
            {
                Console.WriteLine("Error: Cliente no encontrado en el registro general. Debe registrarlo primero.");
            }
        }

        static void MostrarCola()
        {
            Console.Clear();
            Console.WriteLine("--- LISTA DE ESPERA (COLA FIFO) ---");

            if (colaEspera.Count == 0)
            {
                Console.WriteLine("La cola de espera está vacía.");
                return;
            }

            int pos = 1;
            foreach (var cliente in colaEspera)
            {
                Console.WriteLine($"{pos}. Turno #{cliente.NumeroTurno} - {cliente.NombreCompleto} ({cliente.TipoServicio})");
                pos++;
            }
            Console.WriteLine($"\nClientes pendientes en cola: {colaEspera.Count}");
        }

        static void AtenderCliente()
        {
            Console.Clear();
            Console.WriteLine("--- ATENDER AL SIGUIENTE CLIENTE (DEQUEUE) ---");

            if (colaEspera.Count == 0)
            {
                Console.WriteLine("No hay clientes en la cola de espera (Cola vacía).");
                return;
            }

            Cliente atendido = colaEspera.Dequeue();
            Console.WriteLine($"¡Atendiendo ahora a: {atendido.NombreCompleto} (Turno #{atendido.NumeroTurno}) - Servicio: {atendido.TipoServicio}!");

            // Guardar automáticamente en el historial de pilas (LIFO)
            string registroHistorial = $"Atendido: {atendido.NombreCompleto} (Turno #{atendido.NumeroTurno}) - {atendido.TipoServicio}";
            pilaHistorial.Push(registroHistorial);
            Console.WriteLine("Operación registrada automáticamente en el historial (Pila).");
        }

        static void ConsultarProximoTurno()
        {
            Console.Clear();
            Console.WriteLine("--- CONSULTAR PRÓXIMO TURNO (PEEK) ---");

            if (colaEspera.Count == 0)
            {
                Console.WriteLine("La cola de espera está vacía.");
                return;
            }

            Cliente proximo = colaEspera.Peek();
            Console.WriteLine($"El próximo cliente en ser atendido es: {proximo.NombreCompleto} (Turno #{proximo.NumeroTurno}) - Servicio: {proximo.TipoServicio}");
        }

        // --- MÓDULO 3: PILAS (LIFO) ---

        static void VerHistorial()
        {
            Console.Clear();
            Console.WriteLine("--- HISTORIAL DE ATENCIONES (PILA LIFO) ---");

            if (pilaHistorial.Count == 0)
            {
                Console.WriteLine("El historial está vacío.");
                return;
            }

            int i = 1;
            foreach (var operacion in pilaHistorial)
            {
                string topeEtiqueta = (i == 1) ? " <-- TOPE (Sale primero)" : "";
                Console.WriteLine($"{i}. {operacion}{topeEtiqueta}");
                i++;
            }
        }

        static void RetirarHistorial()
        {
            Console.Clear();
            Console.WriteLine("--- RETIRAR ÚLTIMA OPERACIÓN DEL HISTORIAL (POP) ---");

            if (pilaHistorial.Count == 0)
            {
                Console.WriteLine("La pila de historial está vacía. No hay operaciones que retirar.");
                return;
            }

            string retirada = pilaHistorial.Pop();
            Console.WriteLine($"Se ha retirado del historial la última operación:\n=> {retirada}");
        }

        // --- FUNCIONALIDAD ADICIONAL (ESTADÍSTICAS) ---

        static void VerEstadisticas()
        {
            Console.Clear();
            Console.WriteLine("--- ESTADÍSTICAS GENERALES DEL SISTEMA ---");
            Console.WriteLine($"- Total de clientes registrados en el arreglo: {contadorClientes} / 20");
            Console.WriteLine($"- Total de clientes pendientes en cola de espera: {colaEspera.Count}");
            Console.WriteLine($"- Total de atenciones finalizadas en el historial (Pila): {pilaHistorial.Count}");
        }
    }
}