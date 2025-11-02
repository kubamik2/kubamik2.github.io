const email_field = document.getElementById("email");
const topic_field = document.getElementById("topic");
const msg_field = document.getElementById("msg");
const email_error = document.getElementById("email-error");
const topic_error = document.getElementById("topic-error");
const msg_error = document.getElementById("msg-error");

function validateForm() {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email_field.value == null || !pattern.test(email_field.value)) {
        email_error.textContent = "Podaj poprawny adres e-mail"
        return false;
    }
    if (msg_field.value == null || msg_field.value.length > 128) {
        msg_error.textContent = `Wiadomość za długa ${msg_field.value.length}/128`
        return false;
    }
    return true;
}

function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email != null && pattern.test(email);
}

document.getElementById("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let email = email_field.value;
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
        alert("Wysłano formularz");
    }
});
