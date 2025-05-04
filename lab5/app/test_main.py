import pytest
from fastapi.testclient import TestClient
from app.main import app, Base, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import time

client = TestClient(app)


# Создание нового сеанса базы данных для каждого теста ПОТОМУ ЧТО БЕЗ ЭТОГО У МЕНЯ НИЧЁ НЕ ХОТЕЛО РАБОТАТЬ!!!!
# @pytest.fixture(scope="function", autouse=True)
# def setup_db():
#     Base.metadata.create_all(bind=engine)
#     yield
#     Base.metadata.drop_all(bind=engine)

# Регистрируем пользователя
def register_test_user():
    response = client.post("/register/", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    assert response.status_code in (200, 400)

# Тест для попытки зарегистрировать пользователя с уже существующим username
def test_register_existing_username():
    client.post("/register/", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    response = client.post("/register/", json={
        "username": "testuser",
        "email": "testuser1@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    assert response.status_code == 400  # Ошибка, так как username уже занят

# Тест для попытки зарегистрировать пользователя с уже существующим email
def test_register_existing_email():
    client.post("/register/", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    response = client.post("/register/", json={
        "username": "newuser",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    assert response.status_code == 400  # Ошибка, так как email уже занят

# Получаем токен
def get_access_token():
    register_test_user()  # Убедимся, что пользователь точно есть
    response = client.post("/token", data={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    return response.json()["access_token"]

# Тестируем получение списка пользователей
def test_get_users():
    access_token = get_access_token()
    response = client.get(
        "/users/",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(user["username"] == "testuser" for user in data)


# Добавляем второй тест для создания пользователя
def test_create_user():
    # Попытка создать пользователя
    response = client.post("/users/", json={
        "username": "newuser11",
        "email": "newuser11@example.com",
        "full_name": "New User",
        "password": "newpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"

# Тест для успешной аутентификации
def test_authenticate_user():
    response = client.post("/token", data={
        "username": "testuser",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

# Тест для неверного username
def test_authenticate_invalid_username():
    response = client.post("/token", data={
        "username": "wronguser",
        "password": "testpassword"
    })
    assert response.status_code == 401  # Ошибка аутентификации

# Тест для неверного password
def test_authenticate_invalid_password():
    response = client.post("/token", data={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401  # Ошибка аутентификации

# Тест для использования истёкшего токена
def test_authenticate_expired_token():
    # Предполагается, что токен истекает через некоторое время
    expired_token = "expired_token_example"  # Это просто пример, нужно будет генерировать его в реальном тесте
    response = client.get("/protected_route", headers={
        "Authorization": f"Bearer {expired_token}"
    })
    assert response.status_code == 401  # Ошибка авторизации

# Тест для получения списка пользователей
def test_get_users():
    access_token = get_access_token()  # Предположим, что эта функция получает токен
    response = client.get("/users/", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0  # Убедитесь, что хотя бы один пользователь есть в списке
    assert "username" in data[0]
    assert "email" in data[0]

# Тест для получения информации о текущем пользователе
def test_get_me():
    access_token = get_access_token()  # Получаем токен
    response = client.get("/users/me", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"  # Проверка, что вернулся правильный пользователь

# Тест для обновления данных пользователя
def test_update_user():
    access_token = get_access_token()  # Получаем токен
    response = client.put("/users/me", json={
        "full_name": "Updated Name",
        "email": "updated@example.com"
    }, headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["email"] == "updated@example.com"

# Тест для попытки обновления с некорректными данными
def test_update_user_invalid_email():
    access_token = get_access_token()  # Получаем токен
    response = client.put("/users/me", json={
        "email": "invalid-email"
    }, headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 400  # Некорректный email

# Тест для удаления пользователя
def test_delete_user():
    access_token = get_access_token()  # Получаем токен
    response = client.delete("/users/me", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted"

# Тест для попытки повторного удаления
def test_delete_user_again():
    access_token = get_access_token()  # Получаем токен
    response = client.delete("/users/me", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 404  # Пользователь уже удалён

# Тест для запросов с неподдерживаемого домена
def test_cors():
    headers = {
        "Origin": "http://notallowed.com"  # Указываем неподдерживаемый домен
    }
    response = client.get("/users/", headers=headers)
    assert response.status_code == 403  # Должна быть ошибка доступа

# Тест для некорректных данных
def test_invalid_data():
    response = client.post("/register/", json={
        "username": "",  # Пустой username
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword"
    })
    assert response.status_code == 400  # Ошибка из-за пустого username

# Тестирование производительности
def test_performance():
    start = time.time()
    for _ in range(100):  # Отправляем 100 запросов
        client.get("/users/")
    end = time.time()
    assert end - start < 2  # Время отклика должно быть менее 2 секунд

# Тест для запросов с неверным токеном
def test_invalid_token():
    response = client.get("/protected_route", headers={
        "Authorization": "Bearer invalid_token"
    })
    assert response.status_code == 401  # Ошибка авторизации
