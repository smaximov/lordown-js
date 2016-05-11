'use strict';

const Lordown = require('../lib')

describe('Lordown', () => {
  const converter = new Lordown

  it('should render a single paragraph', () => {
    expect(converter.convert('hello world')).to.be.equal('hello world\n\n')
  })

  it('should render paragraphs separated by the empty line', () => {
    expect(converter.convert('hello\n\nworld')).to.be.equal('hello\n\nworld\n\n')
  })

  it('should render consecutive lines as a single paragraph', () => {
    expect(converter.convert('hello\nworld')).to.be.equal('hello\nworld\n\n')
  })

  it('should render **text** or __text__ as [strong]text[/strong]', () => {
    expect(converter.convert('**text**')).to.be.equal('[strong]text[/strong]\n\n')
    expect(converter.convert('__text__')).to.be.equal('[strong]text[/strong]\n\n')
  })

  it('should render *text* or _text_ as [em]text[/em]', () => {
    expect(converter.convert('*text*')).to.be.equal('[em]text[/em]\n\n')
    expect(converter.convert('_text_')).to.be.equal('[em]text[/em]\n\n')
  })

  it('should render `text` as [inline]text[/inline]', () => {
    expect(converter.convert('`text`')).to.be.equal('[inline]text[/inline]\n\n')
  })

  it('should render blockquotes', () => {
    expect(converter.convert('> text')).to.be.equal('[quote]text\n\n[/quote]')
    expect(converter.convert('> first line\n> consecutive line'))
      .to.be.equal('[quote]first line\nconsecutive line\n\n[/quote]')
    expect(converter.convert('> first line\n>\n> second line'))
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

    expect(converter.convert(input)).to.be.equal(expected)
  })

  it('should separate blockquotes from paragraphs with the empty line', () => {
    expect(converter.convert('> quote line\nconsecutive line'))
      .to.be.equal('[quote]quote line\nconsecutive line\n\n[/quote]')
    expect(converter.convert('> quote line\n\nparagraph line'))
      .to.be.equal('[quote]quote line\n\n[/quote]paragraph line\n\n')
  })

  it('should render code blocks', () => {
    expect(converter.convert('    console.log(`hello, world`)'))
      .to.be.equal('[code]console.log(`hello, world`)[/code]\n')
  })

  it('should render fenced code blocks', () => {
    expect(converter.convert('```\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code]console.log(`hello, world`)\n[/code]\n')
    expect(converter.convert('``` js\nconsole.log(`hello, world`)\n```'))
      .to.be.equal('[code=js]console.log(`hello, world`)\n[/code]\n')
  })

  it('should render lists', () => {
    expect(converter.convert('- first item\n- second item'))
      .to.be.equal('[list][*]first item\n\n[*]second item\n\n[/list]')

    expect(converter.convert('1) first item\n2) second item'))
      .to.be.equal('[list=1][*]first item\n\n[*]second item\n\n[/list]')
  })

  it('should render inline links', () => {
    expect(converter.convert('[foo](https://foo.bar)'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('should render reference-style links', () => {
    expect(converter.convert('[foo][]\n\n[foo]: https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]foo[/url]\n\n')
  })

  it('should linkify URL-like text', () => {
    expect(converter.convert('https://foo.bar'))
      .to.be.equal('[url=https://foo.bar]https://foo.bar[/url]\n\n')
  })

  it('should render ~~text~~ as [s]text[/s]', () => {
    expect(converter.convert('~~text~~')).to.be.equal('[s]text[/s]\n\n')
  })

  it('should render user mentions', () => {
    expect(converter.convert('@maxcom')).to.be.equal('[user]maxcom[/user]\n\n')
    expect(converter.convert('preceding @user1 text @user2 trailing'))
      .to.be.equal('preceding [user]user1[/user] text [user]user2[/user] trailing\n\n')
  })

  it('should render mentions for usernames with underscores', () => {
  //  expect(converter.convert('@user_with_underscores'))
  //    .to.be.equal('[user]user_with_underscores[/user]\n\n')
    expect(converter.convert('@_user_')).to.be.equal('[user]_user_[/user]\n\n')
  })

  it('should distinguish email addresses from user mentions', () => {
    expect(converter.convert('user@example.com'))
      .to.be.equal('[url=mailto:user@example.com]user@example.com[/url]\n\n')
  })

  it('should ignore mention-like syntax inside code blocks', () => {
    expect(converter.convert('`@foo`')).to.be.equal('[inline]@foo[/inline]\n\n')
    expect(converter.convert('```\n@foo\n```'))
      .to.be.equal('[code]@foo\n[/code]\n')
  })

  it('should render cuts', () => {
    expect(converter.convert(':::\ncut contents\n:::'))
      .to.be.equal('[cut]cut contents\n\n[/cut]')

    expect(converter.convert('::: cut summary\ncut contents\n:::'))
      .to.be.equal('[cut=cut summary]cut contents\n\n[/cut]')
  })
})
