# Lordown [![build status](https://gitlab.com/smaximov/lordown/badges/master/build.svg)](https://gitlab.com/smaximov/lordown/commits/master) [![license](https://img.shields.io/badge/license-UNLICENSE-blue.svg)](https://unlicense.org/)

Lordown &mdash; пользовательский скрипт для преобразования [Markdown][cmark]-разметки в [LORCODE][].

## Разметка

Для справки см. [Commonmark][cmark] и [LORCODE][].

### Параграфы

Параграфы разделяются пустой строкой.

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
