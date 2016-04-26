'use strict';

const Lordown = require('../src')

describe('Lordown', () => {
  const converter = new Lordown
  it('should convert helloworld', () => {
    expect(converter.convert('hello world')).to.be.equal('hello world')
  })
})
