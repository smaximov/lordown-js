'use strict';

const MarkdownIt = require('markdown-it')
const lordown = require('../lib')

describe('Lordown', () => {
  const converter = new MarkdownIt(lordown.OPTIONS)
  converter.use(lordown.plugin)

  it('render a single paragraph', () => {
    expect(converter.render('hello world')).to.be.equal('hello world\n\n')
  })

  it('render paragraphs separated by the empty line', () => {
    expect(converter.render('hello\n\nworld')).to.be.equal('hello\n\nworld\n\n')
  })

  it('render consecutive lines as a single paragraph', () => {
    expect(converter.render('hello\nworld')).to.be.equal('hello\nworld\n\n')
  })

  it('render **text** or __text__ as [strong]text[/strong]', () => {
    expect(converter.render('**text**')).to.be.equal('[strong]text[/strong]\n\n')
    expect(converter.render('__text__')).to.be.equal('[strong]text[/strong]\n\n')
  })

  it('render *text* or _text_ as [em]text[/em]', () => {
    expect(converter.render('*text*')).to.be.equal('[em]text[/em]\n\n')
    expect(converter.render('_text_')).to.be.equal('[em]text[/em]\n\n')
  })

  it('render `text` as [inline]text[/inline]', () => {
    expect(converter.render('`text`')).to.be.equal('[inline]text[/inline]\n\n')
  })

  it('render blockquotes', () => {
    expect(converter.render('> text')).to.be.equal('[quote]text\n\n[/quote]')
    expect(converter.render('> first line\n> consecutive line'))
      .to.be.equal('[quote]first line\nconsecutive line\n\n[/quote]')
    expect(converter.render('> first line\n>\n> second line'))
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

    expect(converter.render(input)).to.be.equal(expected)
  })

  it('separate blockquotes from paragraphs with the empty line', () => {
    expect(converter.render('> quote line\nconsecutive line'))
      .to.be.equal('[quote]quote line\nconsecutive line\n\n[/quote]')
    expect(converter.render('> quote line\n\nparagraph line'))
      .to.be.equal('[quote]quote line\n\n[/quote]paragraph line\n\n')
  })

  it('render code blocks', () => {
    expect(converter.render('    console.log(`hello, world`)'))
      .to.be.equal('[code]console.log(`hello, world`)[/code]\n')
  })

  it('render fenced code blocks', () => {
    expect(converter.render('```\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code]console.log(`hello, world`)\n[/code]\n')
    expect(converter.render('``` js\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code=js]console.log(`hello, world`)\n[/code]\n')
  })

  it('render lists', () => {
    expect(converter.render('- first item\n- second item'))
      .to.be.equal('[list][*]first item\n\n[*]second item\n\n[/list]')

    expect(converter.render('1) first item\n2) second item'))
      .to.be.equal('[list=1][*]first item\n\n[*]second item\n\n[/list]')
  })

  it('render inline links', () => {
    expect(converter.render('[foo](https://foo.bar)'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('render reference-style links', () => {
    expect(converter.render('[foo][]\n\n[foo]: https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('linkify URL-like text', () => {
    expect(converter.render('https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]https://foo.bar[/url]\n\n')
  })

  it('render ~~text~~ as [s]text[/s]', () => {
    expect(converter.render('~~text~~')).to.be.equal('[s]text[/s]\n\n')
  })

  it('render user mentions', () => {
    expect(converter.render('@maxcom')).to.be.equal('[user]maxcom[/user]\n\n')
    expect(converter.render('preceding @user1 text @user2 trailing'))
      .to.be.equal('preceding [user]user1[/user] text [user]user2[/user] trailing\n\n')
  })

  it('render mentions for usernames with underscores', () => {
    expect(converter.render('@user_with_underscores'))
      .to.be.equal('[user]user_with_underscores[/user]\n\n')
    expect(converter.render('@_user_')).to.be.equal('[user]_user_[/user]\n\n')
  })

  it('distinguish email addresses from user mentions', () => {
    expect(converter.render('user@example.com'))
      .to.be.equal('[url=mailto:user@example.com]user@example.com[/url]\n\n')
  })

  it('ignore mention-like syntax inside code blocks', () => {
    expect(converter.render('`@foo`')).to.be.equal('[inline]@foo[/inline]\n\n')
    expect(converter.render('```\n@foo\n```'))
      .to.be.equal('[code]@foo\n[/code]\n')
  })

  it('render cuts', () => {
    expect(converter.render(':::\ncut contents\n:::'))
      .to.be.equal('[cut]cut contents\n\n[/cut]')

    expect(converter.render('::: cut summary\ncut contents\n:::'))
      .to.be.equal('[cut=cut summary]cut contents\n\n[/cut]')
  })

  context('Ignored LORCODE tags', () => {
    const converter = new MarkdownIt(lordown.OPTIONS)
    converter
      .use(lordown.plugin)
      .use(require('../lib/lorcode'))

    it('parse LORCODE list bullets', () => {
      expect(converter.render('[list][*]first[*]second[/list]'))
        .to.be.equal('[list][*]first[*]second[/list]\n\n')

      expect(converter.render('[list][*]first[/list]'))
        .to.be.equal('[list][*]first[/list]\n\n')
    })

    it('parse LORCODE text style tags', () => {
      const tags = [
        's', 'u', 'b', 'i',
        'em', 'strong',
      ]

      for (let tag of tags) {
        expect(converter.render(`pre [${tag}]text[/${tag}] post`))
          .to.be.equal(`pre [${tag}]text[/${tag}] post\n\n`)
      }
    })

    it('parse LORCODE tags with parameters', () => {
      const tags = [
        'list', 'quote', 'cut',
      ]

      for (let tag of tags) {
        expect(converter.render(`pre [${tag}=_parameter_]text[/${tag} post]`))
          .to.be.equal(`pre [${tag}=_parameter_]text[/${tag} post]\n\n`)
      }
    })
  })

  context('Unsupported features', () => {
    const expected = 'Some text\n\n[strong]heading[/strong]\n\nSome text\n\n'
    it('render headings as bold text', () => {
      for (let i = 1; i <= 6; i++) {
        expect(converter.render(`Some text\n${'#'.repeat(i)} heading\nSome text`))
          .to.be.equal(expected)
      }
      for (let c of "-=") {
        expect(converter.render(`Some text\n\nheading\n${c.repeat(10)}\nSome text`))
          .to.be.equal(expected)
      }
    })
  })
})
