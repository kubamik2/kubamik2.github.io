const email_field = document.getElementById("email");
const topic_field = document.getElementById("topic");
const msg_field = document.getElementById("msg");
const email_error = document.getElementById("email-error");
const topic_error = document.getElementById("topic-error");
const msg_error = document.getElementById("msg-error");
const time = document.getElementById("time");

function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email != null && pattern.test(email);
}

document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault(); let email = email_field.value;
    let msg = msg_field.value;
    let topic = topic_field.value;

    email_error.textContent = "";
    topic_error.textContent = "";
    msg_error.textContent = "";

    let is_submit_valid = true;
    if (!validateEmail(email)) {
        email_error.textContent = "Podaj poprawny adres e-mail";
        is_submit_valid = false;
    }

    if (topic == null || topic.value === "") {
        topic_error.textContent = "Wybierz temat";
        is_submit_valid = false;
    }

    if (msg == null || msg.length > 128) {
        msg_error.textContent = `Wiadomość za długa ${msg_field.value.length}/128`;
        is_submit_valid = false;
    }

    if (msg.length == 0) {
        msg_error.textContent = "Wiadomość nie może być pusta";
        is_submit_valid = false;
    }

    if (is_submit_valid) {
        document.getElementById("contact-form").reset();
        alert("Wysłano formularz");
    }
});

function updateTime() {
    function padTimeNum(time) {
        return time.toString().padStart(2, "0");
    }
    const date = new Date();
    const secs = date.getSeconds();
    const mins = date.getMinutes();
    const hours = date.getHours();

    time.textContent = `Current time: ${padTimeNum(hours)}:${padTimeNum(mins)}:${padTimeNum(secs)}`;
}
updateTime();

setInterval(updateTime, 1000);
