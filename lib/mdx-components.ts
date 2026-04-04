import type { MDXComponents } from 'mdx/types'

/**
 * Blokuje niebezpieczne elementy HTML w treści MDX z bazy danych.
 * Zapobiega XSS przez nadpisanie tagów: script, iframe, form, object, embed, link, style.
 */

function blocked(): null {
  return null
}

export const safeMdxComponents: MDXComponents = {
  script: blocked,
  iframe: blocked,
  form: blocked,
  object: blocked,
  embed: blocked,
  link: blocked,
  style: blocked,
}
