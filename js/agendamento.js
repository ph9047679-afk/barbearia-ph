document.addEventListener("DOMContentLoaded", () => {
  // Use apenas uma âncora no HTML: <div id="content"></div>
  const content = document.getElementById("content");
  if (!content) return;

  const state = {
    step: 1,
    service: null,
    barber: null,
    date: null,
    time: null,
    name: "",
    phone: "",
  };

  // Simulação de horários já ocupados
  const bookedSlots = {
    "2026-04-25": ["10:00", "14:00"],
  };

  const services = [
    { name: "Corte", price: 60, duration: 30 },
    { name: "Barba", price: 40, duration: 20 },
    { name: "Combo", price: 90, duration: 60 },
  ];

  const barbers = [
    {
      name: "Lucas",
      photo: "https://i.pinimg.com/736x/29/de/22/29de2228c894353447e2c1fb442bc77e.jpg",
    },
    {
      name: "Gabriel",
      photo: "https://i.pinimg.com/736x/52/69/75/52697519c286d322ff2a958c87e89a1d.jpg",
    },
    {
      name: "Pedro",
      photo: "https://i.pinimg.com/1200x/70/65/81/706581c0674ffb06f155b14b6e74c4e6.jpg",
    },
  ];

  const times = [
    "09:00", "10:00", "11:00",
    "13:00", "14:00", "15:00",
    "17:00", "18:00", "19:00",
  ];

  function getTodayISODate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function render() {
    if (!content) return;

    updateSteps();

    const backBtn =
      state.step > 1
        ? `<button class="btn-back" type="button" onclick="prevStep()">← Voltar</button>`
        : "";

    const summary =
      state.step > 1
        ? `<div class="booking-summary">
             <small>
               ${state.service || ""}
               ${state.barber ? " com " + state.barber : ""}
               ${state.date ? " em " + state.date : ""}
             </small>
           </div>`
        : "";

    let html = backBtn + summary;

    if (state.step === 1) html += renderServices();
    if (state.step === 2) html += renderBarbers();
    if (state.step === 3) html += renderCalendar();
    if (state.step === 4) html += renderTimes();
    if (state.step === 5) html += renderForm();

    content.innerHTML = html;
  }

  function renderServices() {
    return `
      <div class="booking-section">
        <h2>Escolha o serviço</h2>
        <div class="grid grid-3">
          ${services
      .map(
        (s) => `
                <div class="card ${state.service === s.name ? "selected" : ""}"
                     onclick="selectService('${s.name}')">
                  <h3>${s.name}</h3>
                  <p>R$ ${s.price}</p>
                  <span>${s.duration} min</span>
                </div>
              `
      )
      .join("")}
        </div>
      </div>
    `;
  }

  function selectService(name) {
    state.service = name;
    state.step = 2;
    render();
  }

  function renderBarbers() {
    return `
      <div class="booking-section">
        <h2>Escolha o profissional</h2>

        <div class="grid grid-3 barber-grid">
          ${barbers
      .map(
        (b) => `
                <div class="barber-card ${state.barber === b.name ? "selected" : ""}"
                     onclick="selectBarber('${b.name}')">
                  <div class="barber-photo">
                    <img src="${b.photo}" alt="${b.name}" loading="lazy">
                  </div>
                  <h3>${b.name}</h3>
                </div>
              `
      )
      .join("")}
        </div>
      </div>
    `;
  }

  function selectBarber(name) {
    state.barber = name;
    state.step = 3;
    render();
  }

  function renderCalendar() {
    const today = getTodayISODate();

    return `
      <div class="booking-section center">
        <h2>Escolha a data</h2>
        <div class="date-wrapper">
          <input
            type="date"
            class="custom-date"
            min="${today}"
            autocomplete="off"
            onchange="selectDate(this)"
            oninput="selectDate(this)"
            onkeydown="return false"
          >
        </div>
      </div>
    `;
  }

  function selectDate(input) {
    const selectedDate = input.value;
    const today = getTodayISODate();

    if (!selectedDate || selectedDate < today) {
      alert("Por favor, selecione uma data válida");
      input.value = "";
      state.date = null;
      return;
    }

    state.date = selectedDate;
    state.step = 4;
    render();
  }

  function renderTimes() {
    const unavailable = bookedSlots[state.date] || [];

    return `
      <div class="booking-section">
        <h2>Escolha o horário</h2>

        <div class="grid grid-3">
          ${times
      .map((t) => {
        const disabled = unavailable.includes(t);

        return `
                <div class="card ${disabled ? "disabled" : ""} ${state.time === t ? "selected" : ""}"
                     ${!disabled ? `onclick="selectTime('${t}')"` : ""}
                     style="${disabled ? "opacity:0.3;cursor:not-allowed;" : ""}">
                  ${t}
                </div>
              `;
      })
      .join("")}
        </div>
      </div>
    `;
  }

  function selectTime(t) {
    state.time = t;
    state.step = 5;
    render();
  }

  function renderForm() {
    return `
      <div class="booking-section">
        <h2>Seus dados</h2>

        <input
          placeholder="Seu nome"
          value="${state.name}"
          oninput="state.name = this.value"
        >

        <input
          placeholder="Telefone"
          value="${state.phone}"
          oninput="state.phone = this.value"
        >

        <button class="btn-confirm" onclick="confirmBooking()">Confirmar Agendamento</button>
      </div>
    `;
  }

  function confirmBooking() {
    alert("Agendamento realizado!");

    if (!bookedSlots[state.date]) {
      bookedSlots[state.date] = [];
    }

    bookedSlots[state.date].push(state.time);

    location.reload();
  }

  const STORAGE_KEY = "ph_barbearia_agendamentos";

  function readBookingsFromStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveBookingToStorage(booking) {
    const current = readBookingsFromStorage();
    current.push(booking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  function getServiceDetails(serviceName) {
    return services.find((s) => s.name === serviceName) || null;
  }

  function formatGoogleDateTime(dateStr, timeStr, durationMinutes) {
    const [year, month, day] = dateStr.split("-");
    const [hour, minute] = timeStr.split(":");

    const start = `${year}${month}${day}T${hour}${minute}00`;

    const date = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(date.getTime() + durationMinutes * 60000);

    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, "0");
    const endDay = String(endDate.getDate()).padStart(2, "0");
    const endHour = String(endDate.getHours()).padStart(2, "0");
    const endMinute = String(endDate.getMinutes()).padStart(2, "0");

    const end = `${endYear}${endMonth}${endDay}T${endHour}${endMinute}00`;

    return { start, end };
  }

  function buildGoogleCalendarUrl() {
    const service = getServiceDetails(state.service);
    if (!service || !state.date || !state.time) return "#";

    const { start, end } = formatGoogleDateTime(state.date, state.time, service.duration);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Corte na Barbearia do PH",
      dates: `${start}/${end}`,
      details: `Serviço: ${state.service}\nProfissional: ${state.barber}\nCliente: ${state.name}\nTelefone: ${state.phone}`,
      location: "Barbearia do PH",
      ctz: "America/Sao_Paulo",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function buildWhatsAppUrl() {
    const message = `Olá! Acabei de agendar um ${state.service} com ${state.barber} para o dia ${state.date} às ${state.time}.`;
    return `https://wa.me/5511987121153?text=${encodeURIComponent(message)}`;
  }

  function prevStep() {
    if (state.step > 1) {
      state.step--;
      render();
    }
  }

  function updateSteps() {
    document.querySelectorAll(".step").forEach((el, i) => {
      el.classList.toggle("active", i + 1 === state.step);
    });
  }

  Object.assign(window, {
    state,
    selectService,
    selectBarber,
    selectDate,
    selectTime,
    confirmBooking,
    prevStep,
  });

  render();
});
