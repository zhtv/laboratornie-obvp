// Базовый URL для API, к которому будут отправляться запросы
const apiBaseUrl = "http://localhost:8000";
let accessToken = localStorage.getItem('accessToken');

function updateUIState() {
    const isLoggedIn = !!accessToken;
    document.getElementById('authenticated-content').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('login-section').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('login-status').textContent = isLoggedIn ? 'Logged in' : 'Not logged in';
    document.getElementById('logout-button').style.display = isLoggedIn ? 'block' : 'none';
    if (isLoggedIn) {
        fetchUsers().catch(console.error);
    } else {
        document.getElementById("user-list").innerHTML = "";
    }
}

async function handleApiError(response) {
    if (response.status === 401) {
        accessToken = null;
        localStorage.removeItem('accessToken');
        updateUIState();
        throw new Error('Не удалось выполнить аутентификацию. Пожалуйста, войдите в систему еще раз.');
    }
    const error = await response.json();
    throw new Error(error.detail || 'Произошла ошибка');
}

async function fetchUsers() {
    try {
        const response = await fetch(`${apiBaseUrl}/users/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            await handleApiError(response);
            return;
        }
        const users = await response.json();
        const userList = document.getElementById("user-list");
        userList.innerHTML = "";
        users.forEach((user) => {
            const li = document.createElement("li");
            li.textContent = `${user.id}: ${user.username} (${user.email})`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error("Ошибка при выборке пользователей:", error);
        alert(error.message);
    }
}

// Обработчик события отправки формы создания пользователя
document.getElementById("create-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const formData = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            full_name: document.getElementById("full_name").value,
            password: document.getElementById("password").value
        };
        const response = await fetch(`${apiBaseUrl}/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            await handleApiError(response);
            return;
        }

        alert("Пользователь успешно создан");
        e.target.reset();
        fetchUsers();
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error);
        alert(error.message);
    }
});

// Обработчик события отправки формы обновления пользователя
document.getElementById("update-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const userId = document.getElementById("update-user-id").value;
        const formData = {
            username: document.getElementById("update-username").value,
            email: document.getElementById("update-email").value,
            full_name: document.getElementById("update-full_name").value,
            password: document.getElementById("update-password").value
        };
        const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            await handleApiError(response);
            return;
        }
        alert("Пользователь успешно обновился");
        e.target.reset();
        fetchUsers();
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        alert(error.message);
    }
});

// Обработчик события отправки формы удаления пользователя
document.getElementById("delete-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const userId = document.getElementById("delete-user-id").value;
        const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            await handleApiError(response);
            return;
        }
        alert("Пользователь успешно удален");
        e.target.reset();
        fetchUsers();
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        alert(error.message);
    }
});

// Маршрут авторизации пользователя
document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        const response = await fetch(`${apiBaseUrl}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "password",
                username: username,
                password: password,
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Ошибка входа');
        }
        const data = await response.json();
        accessToken = data.access_token;
        localStorage.setItem('accessToken', accessToken);
        updateUIState();
        event.target.reset();
    } catch (error) {
        console.error("Ошибка входа в систему:", error);
        alert(error.message);
    }
});

// Маршрут для выхода пользователя
document.getElementById("logout-button").addEventListener("click", () => {
    accessToken = null;
    localStorage.removeItem('accessToken');
    updateUIState();
});

async function getUserInfo() {
    try {
        if (!accessToken) {
            throw new Error('Please log in first');
        }
        const response = await fetch(`${apiBaseUrl}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            await handleApiError(response);
            return;
        }
        const data = await response.json();
        const userInfoElement = document.getElementById('userInfo');
        userInfoElement.innerHTML = `
            <div class="user-info">
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Full Name:</strong> ${data.full_name || 'Not provided'}</p>
                <p><strong>ID:</strong> ${data.id}</p>
            </div>
        `;
    } catch (error) {
        console.error("Ошибка при получении информации о пользователе:", error);
        document.getElementById('userInfo').innerHTML = `<p class="error">${error.message}</p>`;
    }
}

document.getElementById("get-user-info").addEventListener("click", getUserInfo);

// При загрузке страницы выполняем начальное получение списка пользователей
updateUIState();