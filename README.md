# Lordown [![build status](https://gitlab.com/smaximov/lordown/badges/master/build.svg)](https://gitlab.com/smaximov/lordown/commits/master) [![license](https://img.shields.io/badge/license-UNLICENSE-blue.svg)](https://unlicense.org/)

Lordown &mdash; пользовательский скрипт для преобразования [Markdown][cmark]-разметки в [LORCODE][].

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Установка](#%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0)
- [Конфигурация](#%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B3%D1%83%D1%80%D0%B0%D1%86%D0%B8%D1%8F)
- [Разметка](#%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%82%D0%BA%D0%B0)
  - [Параграфы](#%D0%BF%D0%B0%D1%80%D0%B0%D0%B3%D1%80%D0%B0%D1%84%D1%8B)
  - [Заголовки](#%D0%B7%D0%B0%D0%B3%D0%BE%D0%BB%D0%BE%D0%B2%D0%BA%D0%B8)
  - [Horizontal rule](#horizontal-rule)
  - [Стили текста](#%D1%81%D1%82%D0%B8%D0%BB%D0%B8-%D1%82%D0%B5%D0%BA%D1%81%D1%82%D0%B0)
  - [Ссылки](#%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B8)
  - [Сноски](#%D1%81%D0%BD%D0%BE%D1%81%D0%BA%D0%B8)
  - [Изображения](#%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F)
  - [Ссылка на профиль пользователя (каст)](#%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B0-%D0%BD%D0%B0-%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8C-%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F-%D0%BA%D0%B0%D1%81%D1%82)
  - [Списки](#%D1%81%D0%BF%D0%B8%D1%81%D0%BA%D0%B8)
  - [Цитаты](#%D1%86%D0%B8%D1%82%D0%B0%D1%82%D1%8B)
  - [Спойлер (кат)](#%D1%81%D0%BF%D0%BE%D0%B9%D0%BB%D0%B5%D1%80-%D0%BA%D0%B0%D1%82)
  - [Код](#%D0%BA%D0%BE%D0%B4)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

![Lordown](https://gitlab.com/smaximov/lordown/raw/master/lordown.png)

## Установка

_Требуется наличие расширения для управления пользовательскими скриптами
(Greasemonkey, Violent monkey, Tampermonkey)._

Добавьте файл [lordown.user.js](https://gitlab.com/smaximov/lordown/raw/master/dist/lordown.user.js)
к пользовательским скриптам браузера.

## Конфигурация

Поведение скрипта можно настраивать с помощью опций, которые хранятся в локальном хранилище
([LocalStorage][]) браузера. Чтобы задать значение какой-либо опции, нужно
ввести в браузерной консоли выражение `localStorage.setItem('опция', 'значение')`. Список
опций представлен в таблице ниже:

[LocalStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage

| Опция | Значение по умолчанию | Описание |
|------|-----------------------|----------|
| `lordown.debug` | `false` | Отладочная печать в браузерную консоль |
| `lordown.footnote` | `true` | Включить сноски? (см. соответствующий раздел) |
| `lordown.footnote.caption` | `Сноски` | Название блока сносок |

Для того, чтобы изменения приступили в силу, нужно перезагрузить страницу
(для всех опций, кроме `lordown.debug`).

Также работу скрипта можно временно приостановить, кликнув на кнопку `Lordown` над
полем ввода.

## Разметка

Для справки см. [Commonmark][cmark] и [LORCODE][].

### Параграфы

Параграфы разделяются пустой строкой.

### Заголовки

Так как LORCODE не поддерживает заголовки, вместо них отображается **жирный текст** отдельным параграфом:

```
Some text
# heading
Some text
```

или

```
Some text

heading
=======
Some text
```

превращается в

```
Some text

[strong]heading[/strong]

Some text
```

### Horizontal rule

Линии (*hrule*, *horizontal rule*) отображаются без изменений отдельным параграформ:

```
Some text

****

Some text
```

превращается в

```
Some text

****

Some text
```

### Стили текста

| Markdown | Lorcode | Примечание |
|----------|---------|------------|
| `_курсив_` или `*курсив*` | `[em]курсив[/em]` | _курсив_ |
| `__жирный текст__` или `**жирный текст**` | `[strong]жирный текст[/strong]` | **жирный текст** |
| `~~зачеркнутый текст~~` | `[s]зачеркнутый текст[/s]` | ~~зачеркнутый текст~~ |

### Ссылки

Поддерживаются _inline_-ссылки и _reference_-ссылки.
Приведённые ниже примеры соответствуют LORCODE-разметке `[url=https://youtu.be/dQw4w9WgXcQ]ссылка[/url]` ([ссылка](https://youtu.be/dQw4w9WgXcQ)):

* Inline-ссылки: `[ссылка](https://youtu.be/dQw4w9WgXcQ)`
* Reference-ссылки:

    ```
    [ссылка][ref-id]
    ...
    [ref-id]: https://youtu.be/dQw4w9WgXcQ

    ```

    или

    ```
    [ссылка][]
    ...
    [ссылка]: https://youtu.be/dQw4w9WgXcQ
    ```

Кроме того, текст, похожий на ссылку, автоматически оборачивается в LORCODE-тег `[url]`:

| Markdown | Lorcode | Примечание |
|----------|---------|------------|
| `https://youtu.be/dQw4w9WgXcQ` или `<https://youtu.be/dQw4w9WgXcQ>` | `[url=https://youtu.be/dQw4w9WgXcQ]https://youtu.be/dQw4w9WgXcQ[/url]` | URL |
| `user@example.com` или `<user@example.com>` | `[url=mailto:user@example.com]user@example.com[/url]` | email |

### Сноски

Сноска &mdash; примечание к тексту, помещаемое в конце сообщения. Синтаксис:

* Inline-сноска: `текст^[сноска]`
* Reference-сноска:

    ```
    текст[^footnote-id]
    ...
    [^footnote-id]: сноска
    ```

    Reference-сноска может состоять из нескольких абзацев. Для этого последующие абзацы
    должны быть выровнены относительно основного текста.

Пример:

```
Текст со сноской^[inline-сноска] и ещё одной[^сн-1]. И ещё[^сн-2].

[^сн-1]: reference-сноска
[^сн-2]: эта сноска состоит из нескольких абзацев

    второй абзац обозначен индентацией

Тут идёт другой текст.
```

LORCODE

```
Текст со сноской[1] и ещё одной[2]. И ещё[3].

Тут идёт другой текст.

[strong]Сноски[/strong]:

[list=1][*]inline-сноска

[*]reference-сноска

[*]эта сноска состоит из нескольких абзацев

второй абзац обозначен индентацией

[/list]
```

Сноски можно выключить с помощью опции `lordown.footnote` (см. раздел **Конфигурация**).
Текст, который выводится перед блоком сносок (**Сноски** в примере выше), можно задать
с помощью опции `lordown.footnote.caption`.

### Изображения

Изображения выводятся как ссылки (`![foo](bar.png)` превращается в `[url=bar.png]foo[/url]`).

### Ссылка на профиль пользователя (каст)

`@maxcom` превращается в `[user]maxcom[/user]`.


### Списки

Неупорядоченные (_unordered_, _bullet_) списки создаются с помощью символов `*`, `+` или `-`:

```
- First item
- Second item
- Third item
```

Элементы упорядоченных (_ordered_) списков обозначаются числами с точкой (`.`) или закрывающей скобкой (`)`) в конце:

```
1. First item
2. Second item
3. Third item
```

Для обозначение вложенности списков используется выравнивание:

```
+ Item 1
+ Item 2
  1) Item 2.1
  2) Item 2.2
+ Item 3
```

### Цитаты

Цитата выделяется символом `>` в начале строки.

### Спойлер (кат)

Код

```
:::
Текст, который будет скрыт внутри спойлера
:::
```

Превращается в

```
[cut]Текст, который будет скрыт внутри спойлера[/cut]
```

Первой строкой можно указать необязательный текст ссылки:

```
::: Текст, который будет выведен в ссылке вместо скрытого внутри cut содержимого
Текст, который будет скрыт внутри спойлера
:::
```

Ему будет соответствовать

```
[cut=Текст, который будет выведен в ссылке вместо скрытого внутри cut содержимого]
Текст, который будет скрыт внутри спойлера
[/cut]
```

### Код

Для _inline_-кода исползуется конструкция типа `` `inline code` ``,
которая превращается в `[inline]inline code[/inline]`.

Блоки кода выравниваются минимум 4 пробелами. Коду

```
    int main(void) {
        return 0;
    }
```

соответствует

```
[code]int main(void) {
    return 0;
}[/code]
```

Также можно использовать _fenced_-блоки, для которых можно указать язык
программирования для подсветки синтаксиса:

    ``` c
    int main(void) {
        return 0;
    }
    ```

превращается в

```
[code=c]int main(void) {
    return 0;
}[/code]
```

[cmark]: http://commonmark.org/
[LORCODE]: https://www.linux.org.ru/help/lorcode.md
