
### Факты по продукту, уже зафиксированные в проекте

* Продукт: lightweight financial behavior tracker.
* Это не полный YNAB-клон.
* Это не цифровой курс целиком.
* Это не коуч-бот.
* Цель: ежедневный финансовый трекинг + закрепление поведенческих практик курса.
* Платформа: iPhone-first.
* Режим: single-user, local-first.
* На старте: без backend и auth.
* Стек: Expo + React Native + TypeScript + Expo Router + Expo SQLite.
* Из YNAB в v1 берём: capture, categories/buckets, give money a job, basic planning, goals, weekly review, simple reports.
* Из курса в v1 берём: финансовый мониторинг, резерв, фонд радости, артефакт цели, денежные ступени, streaks, циклы 14/21/30 дней, минимум/оптимум/максимум.
* Не берём в v1: bank sync, shared budgets, сложный backend, AI-коуч, social, heavy analytics.

### Факты из корпуса курса

Курс сам задаёт модель “80% психика / 20% механика”, а обучение строится пошагово: модуль → ДЗ → отчёт → доступ к следующему модулю. Это не просто контент, а система закрепления через практику и гейты. 

Начиная с блока про финансовый порядок, курс явно смещает акцент в сторону механики: контроль денег, порядок, распределение, резерв, стратегия и прогнозирование. 

В курсе финансовый порядок трактуется как контроль движения денег: если не контролируешь, не управляешь; если контролируешь, появляется система, которая начинает работать “на полуавтомате”. 

В 11-м модуле среди дополнительных практик прямо перечислены: порядок в кошельке, годовой финансовый отчёт, накопление резерва, ежемесячная финансовая стратегия, фонд радости, генератор идей и практика “Артефакт”.

Курс делает резерв и удовольствия двумя ключевыми фондами: резерв — про безопасность, удовольствия — про поддержание мотивации и “внутреннего ребёнка”. 

Механика “денежных ступеней” строится на постепенном повышении “уровня нормы”: не резкий скачок, а шаг за шагом встраивание более качественных атрибутов жизни в постоянную рутину. 

Финальный модуль фиксирует ключевую связку курса: разовые задания дают активацию, а ежедневные и повседневные практики дают интеграцию. Без интеграции всё откатывается. 

В предыдущей синтезированной архитектуре курса уже было выделено, что для приложенческого слоя особенно важны: визуальные цепочки, циклы 14/21/30 дней, артефакт, финансовый мониторинг, фонд радости и разделение минимум / оптимум / максимум.

## 2. Аналитические выводы

1. Для v1 правильная форма продукта — не “приложение про финансы вообще”, а “операционная панель финансового поведения”.
   Это значит: меньше сущностей, меньше бухгалтерии, меньше настроек, больше ежедневного действия и еженедельного пересмотра.

2. Главный объект приложения — не бюджет, а цикл поведения.
   Транзакции, категории и планирование нужны, но они должны обслуживать формирование поведения: замечать, распределять, удерживать резерв, не забывать про фонд радости, двигаться по ступеням, делать weekly review.

3. Из курса в v1 надо брать не объяснения, а механики-переносчики.
   То есть не уроки про ответственность и убеждения, а их “операционные следы”: ежедневная фиксация, повторяемость, формулировки, маленькие шаги, награда, артефакт, циклы.

4. Один главный риск v1 — сделать “маленький YNAB”.
   Если в центре окажется только учёт и категории, курс растворится. Если в центре окажется только “мотивация”, исчезнет полезность. Поэтому каркас должен быть: capture → allocate → reinforce → review.

5. Для single-user local-first v1 не нужен сложный финмодуль.
   Достаточно ручного ввода, локальных счетов, категорий, простых фондов, месячного плана, простых отчётов и экспортов.

6. Самая сильная продуктовая ставка — weekly review как место сборки всего смысла.
   Именно там связываются факты, план, поведение, шаги, резерв, фонд радости и следующий цикл.

## 3. Продуктовые гипотезы

1. Если daily capture встроен в один быстрый сценарий до 10 секунд, то приложение станет ежедневным, а не “ревью-раз-в-неделю”.

2. Если фонд радости будет обязательной сущностью, а не опцией, удержание будет выше: пользователь не будет воспринимать систему как аскетичную и штрафующую.

3. Если денежные ступени будут оформлены как отдельный прогресс-слой, курс начнёт ощущаться не как теория, а как реальные изменения образа жизни.

4. Если weekly review будет коротким и структурированным, именно он станет основным драйвером продолжения использования.

5. Если циклы 14/21/30 дней встроить как лёгкие челленджи поверх базовых привычек, это даст ощущение движения без тяжёлой геймификации.

---

# 4. MVP ТЗ

## 4.1 Product brief

### Назначение

Мобильное iPhone-first приложение для ежедневного учёта денег и закрепления финансовых поведенческих практик курса «Мастер денег».

### Целевая роль пользователя

Один пользователь, который хочет:

* быстро фиксировать расходы и доходы;
* заранее распределять деньги по задачам;
* регулярно откладывать в резерв;
* не “срываться” из-за слишком жёсткой системы;
* видеть реальные шаги к более устойчивому и более качественному финансовому образу жизни.

### Job to be done

“Помоги мне каждый день держать деньги под контролем, не выгорать, двигаться к целям и закреплять правильные финансовые привычки без перегруза.”

### Product promise

Не учит деньгам с нуля, не заменяет курс, не делает сложный бюджетный учёт. Помогает каждый день выполнять финансовую механику и удерживать поведение.

### Product principles

* local-first;
* fast capture first;
* one-person workflow;
* finance + behavior, а не просто finance;
* меньше настроек, больше ясности;
* геймификация только за реальные действия;
* курс присутствует как операционная логика, а не как библиотека уроков.

## 4.2 Цели MVP

### Пользовательские цели

* фиксировать 90–100% ручных транзакций;
* понимать, куда “назначены” деньги;
* ежемесячно откладывать в резерв;
* стабильно выделять фонд радости;
* проходить короткие циклы привычек;
* делать weekly review.

### Продуктовые цели

* сделать приложение полезным уже в первый день;
* избежать ощущения “слишком сложного бюджетного софта”;
* дать минимум 1 сильную ежедневную причину открыть приложение;
* заложить структуру, которую потом можно развить в RFC и implementation plan.

## 4.3 Обязательное ядро v1

1. Быстрый ручной capture доходов и расходов.
2. Категории / buckets.
3. Give money a job: распределение по фондам и целям.
4. Резерв.
5. Фонд радости.
6. Простые финансовые цели.
7. Артефакт цели.
8. Денежные ступени.
9. Циклы 14/21/30 дней.
10. Streaks и визуальная ежедневная отметка.
11. Weekly review.
12. Простые отчёты.
13. Локальное хранение + экспорт/бэкап.

## 4.4 Core loop

### Ежедневная петля

Открыл приложение → увидел “Сегодня” → зафиксировал доход/расход → назначил категории / job → при необходимости распределил по резерву / фонду радости / цели → получил обновление прогресса по дню, циклу и ступени.

### Еженедельная петля

Открыл weekly review → посмотрел факты недели → подтвердил/скорректировал план → отметил выполнение практик → назначил приоритет на следующую неделю → увидел прогресс по резерву, цели, фонду радости, циклу и ступени.

### Месячная петля

Создал/обновил месячный план → назначил деньги фондам и целям → в конце месяца увидел итоги, сколько ушло на обязательное, резерв, радость и цели → выбрал следующую денежную ступень или закрепление текущей.

## 4.5 Экраны v1

### 1. Today / Dashboard

Главный экран.

Содержит:

* текущий остаток по основным счетам;
* сколько осталось нераспределённых денег;
* быстрые кнопки “Расход”, “Доход”, “Перевод”, “Отметить практику”;
* статус дня: capture done / review pending / cycle status;
* прогресс резерва;
* прогресс фонда радости;
* активная цель и артефакт;
* текущая денежная ступень;
* мини-блок “Что важно сегодня”.

Роль экрана:
единая точка входа в ежедневное использование.

### 2. Add Transaction

Экран быстрого ввода транзакции.

Поля:

* тип: expense / income / transfer / adjustment;
* сумма;
* счёт;
* категория;
* дата/время;
* заметка;
* флаг “это вклад в цель / резерв / фонд радости”;
* опционально теги.

Требование:
основной сценарий должен проходиться за 2–3 тапа после открытия.

### 3. Plan / Buckets

Экран распределения денег.

Содержит:

* список buckets;
* available / assigned / spent;
* быстрые правила распределения;
* обязательные buckets: primary, reserve, joy, goals;
* месячный план;
* состояние “есть нераспределённые деньги”.

Роль:
реализация give money a job в облегчённой форме.

### 4. Goals & Artifact

Экран целей.

Содержит:

* список активных целей;
* target amount, current amount, due date;
* привязанный артефакт;
* тип цели: reserve / purchase / freedom / other;
* статус: active / paused / achieved;
* визуальный прогресс.

Отдельно:

* экран/модалка артефакта с фото, текстом “почему это важно”, правилом разблокировки.

### 5. Cycles & Practices

Экран поведенческого слоя.

Содержит:

* активный цикл: 14 / 21 / 30 дней;
* выбранные практики цикла;
* чек-ины по дням;
* streak;
* статус minimum / optimum / maximum;
* история завершённых циклов.

Практики v1:

* capture all;
* review today;
* reserve action;
* joy fund action;
* no-spend window или custom;
* money step action.

### 6. Weekly Review

Экран еженедельного обзора.

Содержит:

* сколько заработано / потрачено;
* overspent categories;
* были ли пополнения резерва и joy fund;
* выполнен ли цикл;
* что с целью;
* короткие вопросы:

  * что сработало;
  * где был срыв;
  * какая одна корректировка на следующую неделю;
  * следующая ступень или закрепление.

### 7. Reports

Простые отчёты.

Содержит:

* расходы по категориям;
* доход/расход по неделям и месяцам;
* динамика резерва;
* динамика фонда радости;
* прогресс целей;
* completion rate по циклам.

Без сложной аналитики, только понятные графики и summaries.

### 8. Settings / Data

Экран настроек.

Содержит:

* валюта;
* старт недели;
* дефолтный цикл;
* экспорт JSON/CSV;
* импорт локальной копии;
* reset demo data;
* управление категориями и дефолтными фондами;
* optional passcode toggle later-ready, но не обязателен в v1.

## 4.6 User flows

### Flow 1. First launch / onboarding

1. Пользователь открывает приложение.
2. Выбирает валюту.
3. Создаёт 1–3 счета: cash / card / savings.
4. Видит предсозданные buckets:

   * Primary
   * Reserve
   * Joy Fund
   * Goals
   * Flexible
5. Выбирает стартовый цикл: 14 / 21 / 30 дней.
6. Создаёт первую цель.
7. Опционально прикрепляет артефакт.
8. Попадает на Today.

### Flow 2. Daily expense capture

1. На Today жмёт “Расход”.
2. Вводит сумму.
3. Выбирает счёт.
4. Выбирает категорию.
5. Сохраняет.
6. Возвращается на Today и видит обновлённый статус.

### Flow 3. Income allocation

1. Пользователь вводит доход.
2. После сохранения приложение предлагает “распределить деньги”.
3. Пользователь назначает части:

   * на обязательное;
   * в резерв;
   * в фонд радости;
   * на цель.
4. Если не распределил всё, приложение показывает remaining to assign.

### Flow 4. Weekly review

1. На Today видно напоминание “Review due”.
2. Пользователь открывает Weekly Review.
3. Видит факты недели.
4. Отмечает выводы.
5. Корректирует buckets.
6. Подтверждает фокус следующей недели.
7. Получает завершение weekly checkpoint.

### Flow 5. Goal + artifact

1. Пользователь создаёт цель.
2. Прикрепляет артефакт.
3. По мере пополнения цели видит прогресс.
4. После достижения цель помечается achieved.
5. Артефакт считается “разблокированным”.

### Flow 6. Cycle completion

1. Пользователь каждый день отмечает практики.
2. Если день пропущен — поведение зависит от типа цикла:

   * soft mode: день отмечается как missed, но цикл не обнуляется;
   * classic course mode: streak сбрасывается.
3. По завершении цикла пользователь получает badge/history entry и может запустить следующий.

Для v1 лучше включить soft mode по умолчанию, а classic reset оставить настройкой.

## 4.7 Геймификация без перегруза

### Что включаем

* streak по дням;
* completion ring дня;
* weekly checkpoint;
* циклы 14/21/30;
* status levels minimum / optimum / maximum;
* денежные ступени;
* артефакты целей;
* небольшие badge-события: “7 дней capture”, “4 weekly reviews”, “reserve streak”, “first step upgraded”.

### Что не включаем

* очки, монеты, магазины наград;
* random rewards;
* соревновательность;
* виртуальный аватар;
* агрессивные штрафы;
* сложные achievement trees.

### Принципы геймификации

* награда только за реальное действие;
* прогресс читается за 1–2 секунды;
* no shame UX: ошибки не унижают пользователя;
* важнее continuity, чем perfection;
* joy fund и artifact работают как реальные награды, а не как нарисованные.

## 4.8 Minimum / Optimum / Maximum в приложении

Это не контентный режим курса, а слой операционного исполнения.

### Minimum

Обязательный минимум дня/недели:

* зафиксировать транзакции;
* не оставить money unassigned надолго;
* сделать weekly review;
* держать активным хотя бы один цикл.

### Optimum

* регулярно пополнять резерв;
* вести joy fund;
* еженедельно обновлять план;
* держать одну активную цель.

### Maximum

* параллельно вести 2–3 цикла;
* делать денежные ступени;
* вести несколько целей;
* регулярно анализировать отчёты и корректировать категории.

## 4.9 Модель сущностей

Основные сущности v1:

* Account
* Transaction
* Category
* BucketPlan
* Goal
* GoalContribution
* Artifact
* MoneyStep
* Cycle
* PracticeDefinition
* PracticeCheckin
* WeeklyReview
* AppSetting
* BackupSnapshot

Связи:

* account 1:N transactions
* category 1:N transactions
* goal 1:N contributions
* goal 0:1 artifact
* cycle 1:N checkins
* practice_definition 1:N checkins
* weekly_review связывает week period с summary и decisions
* money_step может ссылаться на goal/artifact или быть самостоятельным

## 4.10 SQLite schema draft

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- cash | card | savings | other
  currency TEXT NOT NULL,
  opening_balance_cents INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,              -- expense | income | transfer_virtual
  bucket_type TEXT,                -- primary | reserve | joy | goal | flexible | income
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- expense | income | transfer | adjustment
  account_id TEXT NOT NULL,
  to_account_id TEXT,
  category_id TEXT,
  amount_cents INTEGER NOT NULL,
  happened_at TEXT NOT NULL,
  note TEXT,
  goal_id TEXT,
  money_step_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (money_step_id) REFERENCES money_steps(id)
);

CREATE TABLE monthly_bucket_plans (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL,         -- YYYY-MM
  category_id TEXT NOT NULL,
  planned_cents INTEGER NOT NULL DEFAULT 0,
  assigned_cents INTEGER NOT NULL DEFAULT 0,
  carryover_mode TEXT NOT NULL DEFAULT 'carry', -- carry | reset
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (month_key, category_id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal_type TEXT NOT NULL,         -- reserve | purchase | freedom | custom
  target_cents INTEGER NOT NULL,
  current_cents INTEGER NOT NULL DEFAULT 0,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | achieved | archived
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  goal_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image_uri TEXT,
  unlock_rule_type TEXT NOT NULL,  -- goal_reached | amount_reached | manual
  unlock_amount_cents INTEGER,
  unlocked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

CREATE TABLE goal_contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  transaction_id TEXT,
  amount_cents INTEGER NOT NULL,
  happened_at TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE money_steps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,         -- lifestyle | purchase_upgrade | routine_upgrade
  target_frequency TEXT,           -- monthly | weekly | daily | custom
  target_value INTEGER,
  status TEXT NOT NULL DEFAULT 'active', -- active | achieved | paused | archived
  started_at TEXT NOT NULL,
  achieved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE practice_definitions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,       -- capture_all | reserve_action | joy_action | review_done ...
  title TEXT NOT NULL,
  scope TEXT NOT NULL,             -- daily | weekly | cycle
  is_system INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration_days INTEGER NOT NULL,  -- 14 | 21 | 30
  mode TEXT NOT NULL DEFAULT 'soft', -- soft | classic_reset
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | completed | failed | cancelled
  target_level TEXT NOT NULL DEFAULT 'minimum', -- minimum | optimum | maximum
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE cycle_practices (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL,
  practice_definition_id TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 1,
  UNIQUE (cycle_id, practice_definition_id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);

CREATE TABLE practice_checkins (
  id TEXT PRIMARY KEY,
  cycle_id TEXT,
  practice_definition_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,      -- YYYY-MM-DD
  status TEXT NOT NULL,            -- done | missed | skipped
  note TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (cycle_id, practice_definition_id, checkin_date),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (practice_definition_id) REFERENCES practice_definitions(id)
);

CREATE TABLE weekly_reviews (
  id TEXT PRIMARY KEY,
  week_key TEXT NOT NULL UNIQUE,   -- YYYY-WW
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  income_cents INTEGER NOT NULL DEFAULT 0,
  expense_cents INTEGER NOT NULL DEFAULT 0,
  reserve_delta_cents INTEGER NOT NULL DEFAULT 0,
  joy_delta_cents INTEGER NOT NULL DEFAULT 0,
  reflection TEXT,
  next_focus TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_transactions_account_date ON transactions(account_id, happened_at);
CREATE INDEX idx_transactions_category_date ON transactions(category_id, happened_at);
CREATE INDEX idx_transactions_goal ON transactions(goal_id);
CREATE INDEX idx_bucket_plans_month ON monthly_bucket_plans(month_key);
CREATE INDEX idx_checkins_date ON practice_checkins(checkin_date);
```

## 4.11 Бизнес-правила

1. Любая транзакция обязана иметь account_id.
2. Expense и income должны иметь category_id.
3. Transfer не должен влиять на income/expense reports.
4. После income приложение должно предлагать распределение.
5. Reserve и Joy Fund должны существовать как системные категории по умолчанию.
6. Goal может пополняться либо через отдельный income allocation, либо через обычную транзакцию с goal_id.
7. Weekly review считается пропущенным, если неделя закрылась без review.
8. Cycle может быть только один active по умолчанию в v1.
9. Money step считается achieved только после подтверждения пользователем.
10. Artifact unlock не должен происходить “за баллы”, только за фактическое достижение условия.

## 4.12 Навигационная структура

Рекомендуемая нижняя навигация:

* Today
* Plan
* Goals
* Review
* More

Внутри More:

* Reports
* Cycles
* Settings

Причина:
Today и Add Transaction должны быть ближе всего; Review не должен прятаться слишком глубоко.

## 4.13 Нефункциональные требования

### Производительность

* cold start < 2 сек на современном iPhone;
* сохранение транзакции без заметной задержки;
* отчёты по 12 месяцам должны строиться локально без лага.

### Надёжность

* данные не теряются при закрытии приложения;
* операции записи транзакций — атомарные;
* есть миграции SQLite схемы;
* есть защита от дублирования при двойном тапе.

### Offline-first

* 100% базового функционала работает без сети;
* никакие ключевые сценарии не завязаны на сервер.

### Data portability

* экспорт JSON полного снапшота;
* экспорт CSV транзакций;
* импорт JSON снапшота.

### UX

* все ключевые сценарии доступны одной рукой;
* primary actions крупные и быстрые;
* нет перегруженных таблиц на мобильном;
* не больше 1–2 ключевых решений на экран.

### Безопасность

* без auth в v1;
* данные хранятся локально;
* опциональный app lock может быть добавлен позже;
* не обещать банковский уровень защиты до появления полноценной модели безопасности.

### Accessibility

* Dynamic Type friendly;
* tap targets не меньше 44pt;
* достаточный контраст;
* поддержка VoiceOver на ключевых экранах.

## 4.14 Out of scope

* bank sync;
* OCR чеков;
* shared budgets;
* multi-user;
* cloud sync;
* auth;
* AI coach / AI categorization;
* full course content;
* advanced investments;
* debt snowball/avalanche planner как отдельный модуль;
* subscription billing;
* widgets/watch app;
* deep analytics;
* community/social;
* gamified economy с очками, валютой и магазином.

## 4.15 Что потом можно вынести в RFC / implementation plan

### RFC-слои

1. Product scope and principles
2. Domain model
3. Navigation and UX map
4. Persistence and migrations
5. Reporting logic
6. Cycle engine
7. Import/export
8. QA scenarios

### Этапы реализации

#### Phase 1

* schema
* accounts
* categories
* transactions
* Today
* Add Transaction

#### Phase 2

* buckets / monthly plans
* reserve / joy fund
* goals
* weekly review

#### Phase 3

* cycles
* streaks
* money steps
* artifacts
* reports
* export/import

## 4.16 Рекомендуемый MVP-срез по сроку реализации

Если жёстко резать до “самого первого полезного ядра”, то я бы запускал так:

* Today
* Add Transaction
* Plan/Buckets
* Goals
* Weekly Review
* Cycles
* Settings with export

А Reports, Artifacts и Money Steps делал бы сразу после этого, потому что именно они добавят “курс” в продукт, а не просто бюджетирование.

---

## 5. Итоговая формула MVP

Это не “маленький финансовый менеджер”.
И не “курс в приложении”.

Это:
**ежедневный capture + простое распределение денег + резерв и joy fund + циклы поведения + weekly review + реальные маркеры прогресса курса.**


