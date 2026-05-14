const API = "http://localhost:3000";

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'Login.html';
}


async function obtenerDatos(ruta) {
    const res = await fetch(`${API}/${ruta}`);
    const data = await res.json();

    if (!res.ok) {
        console.error(data);
        alert(data.error || "Error en el servidor");
        return [];
    }

    if (!Array.isArray(data)) {
        console.error("La respuesta no es una lista:", data);
        return [];
    }

    return data;
}

async function enviarDatos(ruta, metodo, datos) {
    const res = await fetch(`${API}/${ruta}`, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearear '+token
        },
        body: JSON.stringify(datos)
    });

    const data = await res.json();

    if (!res.ok) {
        console.error(data);
        alert(data.error || "Error en el servidor");
        return null;
    }

    return data;
}

async function eliminarDatos(ruta) {
    const res = await fetch(`${API}/${ruta}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Bearear '+token
        },
    });

    const data = await res.json();

    if (!res.ok) {
        console.error(data);
        alert(data.error || "Error en el servidor");
        return null;
    }

    return data;
}

/* ESPECIALIDADES */

async function cargarEspecialidades() {
    const data = await obtenerDatos("especialidades");

    const tabla = document.getElementById("tablaespecialidades");
    tabla.innerHTML = "";

    data.forEach(Especialidad => {
        tabla.innerHTML += `
            <tr>
                <td>${Especialidad.id_especialidad}</td>
                <td>${Especialidad.nombre}</td>
                <td>${Especialidad.descripcion || ""}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarEspecialidadPorId(${Especialidad.id_especialidad})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEspecialidad(${Especialidad.id_especialidad})">Eliminar</button>
                </td>
            </tr>   
        `;
    });
}

async function guardarEspecialidad() {
    const nombre = document.getElementById("nombre_especialidad").value;
    const descripcion = document.getElementById("descripcion_especialidad").value;

    if (!nombre) {
        alert("Debe escribir el nombre de la especialidad");
        return;
    }

    const data = await enviarDatos("especialidades", "POST", {nombre, descripcion});

    if (!data) return;

    alert(data.mensaje);

    document.getElementById("nombre_especialidad").value = "";
    document.getElementById("descripcion_especialidad").value = "";

    cargarEspecialidades();
}

async function cargarEspecialidadPorId(id) {
    const res = await fetch(`${API}/especialidades/${id}`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al cargar especialidad");
        return;
    }

    document.getElementById("id_especialidad").value = data.id_especialidad;
    document.getElementById("nombre_especialidad").value = data.nombre;
    document.getElementById("descripcion_especialidad").value = data.descripcion || "";
}

async function editarEspecialidad() {
    const id = document.getElementById("id_especialidad").value;
    const nombre = document.getElementById("nombre_especialidad").value;
    const descripcion = document.getElementById("descripcion_especialidad").value;

    if (!id) {
        alert("Debe seleccionar una especialidad para editar");
        return;
    }

    if (!nombre) {
        alert("Debe escribir el nombre de la especialidad");
        return;
    }

    const data = await enviarDatos(`especialidades/${id}`, "PUT", {nombre, descripcion});

    if (!data) return;

    alert(data.mensaje);

    document.getElementById("id_especialidad").value = "";
    document.getElementById("nombre_especialidad").value = "";
    document.getElementById("descripcion_especialidad").value = "";

    cargarEspecialidades();
}

async function eliminarEspecialidad(id) {
    const data = await eliminarDatos(`especialidades/${id}`);

    if (!data) return;

    alert(data.mensaje);
    cargarEspecialidades();
}

/* DOCTORES */

async function cargarDoctores() {
    const data = await obtenerDatos("doctores");

    const tabla = document.getElementById("tabladoctores");
    tabla.innerHTML = "";

    data.forEach(Doctor => {
        tabla.innerHTML += `
            <tr>
                <td>${Doctor.id_doctor}</td>
                <td>${Doctor.nombre}</td>
                <td>${Doctor.apellido}</td>
                <td>${Doctor.telefono || ""}</td>
                <td>${Doctor.correo || ""}</td>
                <td>${Doctor.id_especialidad}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarDoctorPorId(${Doctor.id_doctor})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarDoctor(${Doctor.id_doctor})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function guardarDoctor() {
    const nombre = document.getElementById("nombre_doctor").value;
    const apellido = document.getElementById("apellido_doctor").value;
    const telefono = document.getElementById("telefono_doctor").value;
    const correo = document.getElementById("correo_doctor").value;
    const id_especialidad = document.getElementById("id_especialidad_doctor").value;

    if (!nombre || !apellido || !id_especialidad) {
        alert("Nombre, apellido e ID especialidad son obligatorios");
        return;
    }

    const data = await enviarDatos("doctores", "POST", {
        nombre, apellido, telefono, correo, id_especialidad
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarDoctor();
    cargarDoctores();
}

async function cargarDoctorPorId(id) {
    const res = await fetch(`${API}/doctores/${id}`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al cargar doctor");
        return;
    }

    document.getElementById("id_doctor").value = data.id_doctor;
    document.getElementById("nombre_doctor").value = data.nombre;
    document.getElementById("apellido_doctor").value = data.apellido;
    document.getElementById("telefono_doctor").value = data.telefono || "";
    document.getElementById("correo_doctor").value = data.correo || "";
    document.getElementById("id_especialidad_doctor").value = data.id_especialidad;
}

async function editarDoctor() {
    const id = document.getElementById("id_doctor").value;
    const nombre = document.getElementById("nombre_doctor").value;
    const apellido = document.getElementById("apellido_doctor").value;
    const telefono = document.getElementById("telefono_doctor").value;
    const correo = document.getElementById("correo_doctor").value;
    const id_especialidad = document.getElementById("id_especialidad_doctor").value;

    if (!id) {
        alert("Debe seleccionar un doctor para editar");
        return;
    }

    if (!nombre || !apellido || !id_especialidad) {
        alert("Nombre, apellido e ID especialidad son obligatorios");
        return;
    }

    const data = await enviarDatos(`doctores/${id}`, "PUT", {
        nombre, apellido, telefono, correo, id_especialidad
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarDoctor();
    cargarDoctores();
}

async function eliminarDoctor(id) {
    const data = await eliminarDatos(`doctores/${id}`);

    if (!data) return;

    alert(data.mensaje);
    cargarDoctores();
}

function limpiarDoctor() {
    document.getElementById("id_doctor").value = "";
    document.getElementById("nombre_doctor").value = "";
    document.getElementById("apellido_doctor").value = "";
    document.getElementById("telefono_doctor").value = "";
    document.getElementById("correo_doctor").value = "";
    document.getElementById("id_especialidad_doctor").value = "";
}

/* PACIENTES */

async function cargarPacientes() {
    const data = await obtenerDatos("pacientes");

    const tabla = document.getElementById("tablapacientes");
    tabla.innerHTML = "";

    data.forEach(Paciente => {
        tabla.innerHTML += `
            <tr>
                <td>${Paciente.id_paciente}</td>
                <td>${Paciente.nombre}</td>
                <td>${Paciente.apellido}</td>
                <td>${formatearFecha(Paciente.fecha_nacimiento)}</td>
                <td>${Paciente.telefono || ""}</td>
                <td>${Paciente.correo || ""}</td>
                <td>${Paciente.direccion || ""}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarPacientePorId(${Paciente.id_paciente})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${Paciente.id_paciente})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function guardarPaciente() {
    const nombre = document.getElementById("nombre_paciente").value;
    const apellido = document.getElementById("apellido_paciente").value;
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const telefono = document.getElementById("telefono_paciente").value;
    const correo = document.getElementById("correo_paciente").value;
    const direccion = document.getElementById("direccion_paciente").value;

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios");
        return;
    }

    const data = await enviarDatos("pacientes", "POST", {
        nombre, apellido, fecha_nacimiento, telefono, correo, direccion
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarPaciente();
    cargarPacientes();
}

async function cargarPacientePorId(id) {
    const res = await fetch(`${API}/pacientes/${id}`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al cargar paciente");
        return;
    }

    document.getElementById("id_paciente").value = data.id_paciente;
    document.getElementById("nombre_paciente").value = data.nombre;
    document.getElementById("apellido_paciente").value = data.apellido;
    document.getElementById("fecha_nacimiento").value = data.fecha_nacimiento ? data.fecha_nacimiento.substring(0,10) : "";
    document.getElementById("telefono_paciente").value = data.telefono || "";
    document.getElementById("correo_paciente").value = data.correo || "";
    document.getElementById("direccion_paciente").value = data.direccion || "";
}

async function editarPaciente() {
    const id = document.getElementById("id_paciente").value;
    const nombre = document.getElementById("nombre_paciente").value;
    const apellido = document.getElementById("apellido_paciente").value;
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const telefono = document.getElementById("telefono_paciente").value;
    const correo = document.getElementById("correo_paciente").value;
    const direccion = document.getElementById("direccion_paciente").value;

    if (!id) {
        alert("Debe seleccionar un paciente para editar");
        return;
    }

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios");
        return;
    }

    const data = await enviarDatos(`pacientes/${id}`, "PUT", {
        nombre, apellido, fecha_nacimiento, telefono, correo, direccion
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarPaciente();
    cargarPacientes();
}

async function eliminarPaciente(id) {
    const data = await eliminarDatos(`pacientes/${id}`);

    if (!data) return;

    alert(data.mensaje);
    cargarPacientes();
}

function limpiarPaciente() {
    document.getElementById("id_paciente").value = "";
    document.getElementById("nombre_paciente").value = "";
    document.getElementById("apellido_paciente").value = "";
    document.getElementById("fecha_nacimiento").value = "";
    document.getElementById("telefono_paciente").value = "";
    document.getElementById("correo_paciente").value = "";
    document.getElementById("direccion_paciente").value = "";
}

/* CONSULTORIOS */

async function cargarConsultorios() {
    const data = await obtenerDatos("consultorios");

    const tabla = document.getElementById("tablaconsultorios");
    tabla.innerHTML = "";

    data.forEach(Consultorio => {
        tabla.innerHTML += `
            <tr>
                <td>${Consultorio.id_consultorio}</td>
                <td>${Consultorio.numero_consultorio}</td>
                <td>${Consultorio.disponible}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarConsultorioPorId(${Consultorio.id_consultorio})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarConsultorio(${Consultorio.id_consultorio})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function guardarConsultorio() {
    const numero_consultorio = document.getElementById("numero_consultorio").value;
    const disponible = document.getElementById("disponible").value === "true";

    if (!numero_consultorio) {
        alert("Debe escribir el número de consultorio");
        return;
    }

    const data = await enviarDatos("consultorios", "POST", {
        numero_consultorio, disponible
    });

    if (!data) return;

    alert(data.mensaje);

    document.getElementById("numero_consultorio").value = "";
    document.getElementById("disponible").value = "true";

    cargarConsultorios();
}

async function cargarConsultorioPorId(id) {
    const res = await fetch(`${API}/consultorios/${id}`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al cargar consultorio");
        return;
    }

    document.getElementById("id_consultorio").value = data.id_consultorio;
    document.getElementById("numero_consultorio").value = data.numero_consultorio;
    document.getElementById("disponible").value = String(data.disponible);
}

async function editarConsultorio() {
    const id = document.getElementById("id_consultorio").value;
    const numero_consultorio = document.getElementById("numero_consultorio").value;
    const disponible = document.getElementById("disponible").value === "true";

    if (!id) {
        alert("Debe seleccionar un consultorio para editar");
        return;
    }

    if (!numero_consultorio) {
        alert("Debe escribir el número de consultorio");
        return;
    }

    const data = await enviarDatos(`consultorios/${id}`, "PUT", {
        numero_consultorio, disponible
    });

    if (!data) return;

    alert(data.mensaje);

    document.getElementById("id_consultorio").value = "";
    document.getElementById("numero_consultorio").value = "";
    document.getElementById("disponible").value = "true";

    cargarConsultorios();
}

async function eliminarConsultorio(id) {
    const data = await eliminarDatos(`consultorios/${id}`);

    if (!data) return;

    alert(data.mensaje);
    cargarConsultorios();
}

/* CITAS */

async function cargarCitas() {
    const data = await obtenerDatos("citas");

    const tabla = document.getElementById("tablacitas");
    tabla.innerHTML = "";

    data.forEach(Cita => {
        tabla.innerHTML += `
            <tr>
                <td>${Cita.id_cita}</td>
                <td>${formatearFecha(Cita.fecha)}</td>
                <td>${Cita.hora}</td>
                <td>${Cita.motivo || ""}</td>
                <td>${Cita.estado}</td>
                <td>${Cita.id_paciente}</td>
                <td>${Cita.id_doctor}</td>
                <td>${Cita.id_consultorio}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="cargarCitaPorId(${Cita.id_cita})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarCita(${Cita.id_cita})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function guardarCita() {
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const motivo = document.getElementById("motivo").value;
    const estado = document.getElementById("estado").value || "pendiente";
    const id_paciente = document.getElementById("id_paciente_cita").value;
    const id_doctor = document.getElementById("id_doctor_cita").value;
    const id_consultorio = document.getElementById("id_consultorio_cita").value;

    if (!fecha || !hora || !id_paciente || !id_doctor || !id_consultorio) {
        alert("Fecha, hora, paciente, doctor y consultorio son obligatorios");
        return;
    }

    const data = await enviarDatos("citas", "POST", {
        fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarCita();
    cargarCitas();
}

async function cargarCitaPorId(id) {
    const res = await fetch(`${API}/citas/${id}`);
    const data = await res.json();

    if (!res.ok) {
        alert(data.error || "Error al cargar cita");
        return;
    }

    document.getElementById("id_cita").value = data.id_cita;
    document.getElementById("fecha").value = data.fecha ? data.fecha.substring(0,10) : "";
    document.getElementById("hora").value = data.hora;
    document.getElementById("motivo").value = data.motivo || "";
    document.getElementById("estado").value = data.estado;
    document.getElementById("id_paciente_cita").value = data.id_paciente;
    document.getElementById("id_doctor_cita").value = data.id_doctor;
    document.getElementById("id_consultorio_cita").value = data.id_consultorio;
}

async function editarCita() {
    const id = document.getElementById("id_cita").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const motivo = document.getElementById("motivo").value;
    const estado = document.getElementById("estado").value || "pendiente";
    const id_paciente = document.getElementById("id_paciente_cita").value;
    const id_doctor = document.getElementById("id_doctor_cita").value;
    const id_consultorio = document.getElementById("id_consultorio_cita").value;

    if (!id) {
        alert("Debe seleccionar una cita para editar");
        return;
    }

    if (!fecha || !hora || !id_paciente || !id_doctor || !id_consultorio) {
        alert("Fecha, hora, paciente, doctor y consultorio son obligatorios");
        return;
    }

    const data = await enviarDatos(`citas/${id}`, "PUT", {
        fecha, hora, motivo, estado, id_paciente, id_doctor, id_consultorio
    });

    if (!data) return;

    alert(data.mensaje);
    limpiarCita();
    cargarCitas();
}

async function eliminarCita(id) {
    const data = await eliminarDatos(`citas/${id}`);

    if (!data) return;

    alert(data.mensaje);
    cargarCitas();
}

function limpiarCita() {
    document.getElementById("id_cita").value = "";
    document.getElementById("fecha").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("motivo").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("id_paciente_cita").value = "";
    document.getElementById("id_doctor_cita").value = "";
    document.getElementById("id_consultorio_cita").value = "";
}

/* GENERAL */

function formatearFecha(fecha) {
    if (!fecha) return "";
    return fecha.substring(0, 10);
}

function logout(){  
    localStorage.removeItem("token");
    window.Location.href="Login.html";
}

cargarEspecialidades();
cargarDoctores();
cargarPacientes();
cargarConsultorios();
cargarCitas();