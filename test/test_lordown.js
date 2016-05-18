'use strict';

const MarkdownIt = require('markdown-it')
const lordown = require('../lib')

describe('Lordown', () => {
  const ld = new MarkdownIt(lordown.OPTIONS)
  ld.use(lordown.plugin)

  it('render a single paragraph', () => {
    expect(ld.render('hello world')).to.be.equal('hello world\n\n')
  })

  it('render paragraphs separated by the empty line', () => {
    expect(ld.render('hello\n\nworld')).to.be.equal('hello\n\nworld\n\n')
  })

  it('render consecutive lines as a single paragraph', () => {
    expect(ld.render('hello\nworld')).to.be.equal('hello\nworld\n\n')
  })

  it('render **text** or __text__ as [strong]text[/strong]', () => {
    expect(ld.render('**text**')).to.be.equal('[strong]text[/strong]\n\n')
    expect(ld.render('__text__')).to.be.equal('[strong]text[/strong]\n\n')
  })

  it('render *text* or _text_ as [em]text[/em]', () => {
    expect(ld.render('*text*')).to.be.equal('[em]text[/em]\n\n')
    expect(ld.render('_text_')).to.be.equal('[em]text[/em]\n\n')
  })

  it('render `text` as [inline]text[/inline]', () => {
    expect(ld.render('`text`')).to.be.equal('[inline]text[/inline]\n\n')
  })

  it('render blockquotes', () => {
    expect(ld.render('> text')).to.be.equal('[quote]text\n\n[/quote]')
    expect(ld.render('> first line\n> consecutive line'))
      .to.be.equal('[quote]first line\nconsecutive line\n\n[/quote]')
    expect(ld.render('> first line\n>\n> second line'))
      .to.be.equal('[quote]first line\n\nsecond line\n\n[/quote]')

    let input = `> first line
>> nested quote
>
> consecutive line
`

    let expected = `[quote]first line

[quote]nested quote

[/quote]consecutive line

[/quote]`

    expect(ld.render(input)).to.be.equal(expected)
  })

  it('separate blockquotes from paragraphs with the empty line', () => {
    expect(ld.render('> quote line\nconsecutive line'))
      .to.be.equal('[quote]quote line\nconsecutive line\n\n[/quote]')
    expect(ld.render('> quote line\n\nparagraph line'))
      .to.be.equal('[quote]quote line\n\n[/quote]paragraph line\n\n')
  })

  it('render code blocks', () => {
    expect(ld.render('    console.log(`hello, world`)'))
      .to.be.equal('[code]console.log(`hello, world`)[/code]\n')
  })

  it('render fenced code blocks', () => {
    expect(ld.render('```\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code]console.log(`hello, world`)\n[/code]\n')
    expect(ld.render('``` js\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code=js]console.log(`hello, world`)\n[/code]\n')
  })

  it('render lists', () => {
    expect(ld.render('- first item\n- second item'))
      .to.be.equal('[list][*]first item\n\n[*]second item\n\n[/list]')

    expect(ld.render('1) first item\n2) second item'))
      .to.be.equal('[list=1][*]first item\n\n[*]second item\n\n[/list]')
  })

  it('render inline links', () => {
    expect(ld.render('[foo](https://foo.bar)'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('render reference-style links', () => {
    expect(ld.render('[foo][]\n\n[foo]: https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('linkify URL-like text', () => {
    expect(ld.render('https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]https://foo.bar[/url]\n\n')
  })

  it('render ~~text~~ as [s]text[/s]', () => {
    expect(ld.render('~~text~~')).to.be.equal('[s]text[/s]\n\n')
  })

  it('render user mentions', () => {
    expect(ld.render('@maxcom')).to.be.equal('[user]maxcom[/user]\n\n')
    expect(ld.render('preceding @user1 text @user2 trailing'))
      .to.be.equal('preceding [user]user1[/user] text [user]user2[/user] trailing\n\n')
  })

  it('render mentions for usernames with underscores', () => {
    expect(ld.render('@user_with_underscores'))
      .to.be.equal('[user]user_with_underscores[/user]\n\n')
    expect(ld.render('@_user_')).to.be.equal('[user]_user_[/user]\n\n')
  })

  it('distinguish email addresses from user mentions', () => {
    expect(ld.render('user@example.com'))
      .to.be.equal('[url=mailto:user@example.com]user@example.com[/url]\n\n')
  })

  it('ignore mention-like syntax inside code blocks', () => {
    expect(ld.render('`@foo`')).to.be.equal('[inline]@foo[/inline]\n\n')
    expect(ld.render('```\n@foo\n```'))
      .to.be.equal('[code]@foo\n[/code]\n')
  })

  it('render cuts', () => {
    expect(ld.render(':::\ncut contents\n:::'))
      .to.be.equal('[cut]cut contents\n\n[/cut]')

    expect(ld.render('::: cut summary\ncut contents\n:::'))
      .to.be.equal('[cut=cut summary]cut contents\n\n[/cut]')
  })

  context('Ignored LORCODE tags', () => {
    const ld = new MarkdownIt(lordown.OPTIONS)
    ld
      .use(lordown.plugin)
      .use(require('../lib/lorcode'))

    it('parse LORCODE list bullets', () => {
      expect(ld.render('[list][*]first[*]second[/list]'))
        .to.be.equal('[list][*]first[*]second[/list]\n\n')

      expect(ld.render('[list][*]first[/list]'))
        .to.be.equal('[list][*]first[/list]\n\n')
    })

    it('parse LORCODE text style tags', () => {
      const tags = [
        's', 'u', 'b', 'i',
        'em', 'strong',
      ]

      for (let tag of tags) {
        expect(ld.render(`pre [${tag}]text[/${tag}] post`))
          .to.be.equal(`pre [${tag}]text[/${tag}] post\n\n`)
      }
    })

    it('parse LORCODE tags with parameters', () => {
      const tags = [
        'list', 'quote', 'cut',
      ]

      for (let tag of tags) {
        expect(ld.render(`pre [${tag}=_parameter_]text[/${tag} post]`))
          .to.be.equal(`pre [${tag}=_parameter_]text[/${tag} post]\n\n`)
      }
    })
  })

  context('Unsupported features', () => {
    it('render headings as bold text', () => {
      const expected = 'Some text\n\n[strong]heading[/strong]\n\nSome text\n\n'

      for (let i = 1; i <= 6; i++) {
        expect(ld.render(`Some text\n${'#'.repeat(i)} heading\nSome text`))
          .to.be.equal(expected)
      }
      for (let c of "-=") {
        expect(ld.render(`Some text\n\nheading\n${c.repeat(10)}\nSome text`))
          .to.be.equal(expected)
      }
    })

    it('render hrule as is', () => {
      for (let c of '-*') {
        expect(ld.render(`Some text\n\n${c.repeat(10)}\n\nSome text`))
          .to.be.equal(`Some text\n\n${c.repeat(10)}\n\nSome text\n\n`)
      }
    })

    it('render images as URLs', () => {
      const expected = '[url=bar.png]foo[/url]\n\n'
      expect(ld.render('![foo](bar.png)'))
        .to.be.equal(expected)

      expect(ld.render('![foo][1]\n\n[1]: bar.png'))
        .to.be.equal(expected)

      expect(ld.render('![foo][1]\n\n[1]: bar.png "title"'))
        .to.be.equal(expected)
    })
  })

  context('Footnotes', () => {
    it('render footnotes', () => {
      const ld = new MarkdownIt(lordown.OPTIONS)
      ld.use(lordown.plugin, {
        footnote: true,
        footnoteCaption: 'Footnotes',
      })

      const original = `\
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here is one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.

Here is an inline note.^[Inlines notes are easier to write, since
you do not have to pick an identifier and move down to type the
note.]
`
      const expected = `\
Here is a footnote reference,[1] and another.[2]

Here is an inline note.[3]

[strong]Footnotes[/strong]

[list=1][*]Here is the footnote.

[*]Here is one with multiple blocks.

Subsequent paragraphs are indented to show that they
belong to the previous footnote.

[*]Inlines notes are easier to write, since
you do not have to pick an identifier and move down to type the
note.

[/list]\n
`
      expect(ld.render(original)).to.be.equal(expected)
    })

    it('disabled footnotes', () => {
      expect(ld.render('Text with ^[Inline footnote]'))
        .to.be.equal('Text with ^[Inline footnote]\n\n')
    })
  })
})
