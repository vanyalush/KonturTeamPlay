# КонтурТимПлей

Веб-платформа для тим-лидов и менеджеров с командными играми в реальном времени. Никакой регистрации — зашёл, создал комнату, скинул ссылку команде.

🎮 **Демо:** [konturplay.netlify.app](https://konturplay.netlify.app)

---

## Игры

| Игра | Описание | Игроки |
|------|----------|--------|
| **Moving Motivators** | Расставьте карточки мотиваторов по важности и сравните с командой | 2-8 |
| **Improv Cards** | Раскладывайте карточки в любом порядке и импровизируйте историю | 2-8 |
| **Delegation Poker** | Обсудите уровень делегирования от 1 до 7 для реальных ситуаций | 2-8 |
| **Two Truths and a Lie** | Напишите 3 утверждения, команда угадывает где ложь | 2-8 |

---

## Стек

**Frontend**
- React + Vite
- TailwindCSS
- MobX
- @dnd-kit (drag and drop)
- React Router

**Backend**
- Node.js + Express
- WebSocket (express-ws)

**Хостинг**
- Netlify (клиент)
- Render (сервер)

---

## Запуск локально

### Клиент
```bash
cd client
npm install
npm run dev
```

### Сервер
```bash
cd server
npm install
npm run dev
```

## Деплой

Сервер задеплоен на **Render**, клиент на **Netlify**. При пуше в `main` Netlify автоматически пересобирает клиент.
