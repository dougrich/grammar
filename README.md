# @dougrich/grammar

<a href="https://www.npmjs.com/package/@dougrich/grammar" alt="NPM"><img src="https://img.shields.io/npm/v/@dougrich/grammar" /></a>

<a href="https://github.com/dougrich/grammar" alt="Github"><img src="https://img.shields.io/github/last-commit/dougrich/grammar" /></a>

# Theoretical Structure

`is` and `has` structure.

An object `is` a set of hierarchical terms: for example, a male human name might be a `name/human/male`, while an english town might be a `name/town/english`. Asking for a `name` with no further hinting might result in either a male human name or an english town. This is an example: in a racially segregated fantasy world like Lord of the Rings, it might be better structured as `name/human/town`.

An object `has` a set of named fields. For example, a `town/english` might have the fields:
- Name, which is a `name/town/english`
- Mayor, which is a `person`
- Population, which is a `population/town`

# Operations

`options.load` passed in: asynchronous function that returns all options for a given 'is' condition

`generateDry` generates a 'dry' object that does not expand any fields

`generate` generates the entire tree - essentially a `generateDry` and a `hydrate`

`hydrateStep` takes a partial object and 'hydrates' it one level, expanding it one level

`hydrate` fully expands an object

# Contributing

Tests are critical. Write a test before you write a feature. Write a test after you write a feature. Write a test during the feature. Write lots of tests.

# Stories

As someone who authors content for the grammar:
- I want a simple authoring language
- I want it broken up into multiple files for legibility
- I want it to be easy to add or remove content from
- I want discrete fields (i.e. oneOf)
- I want variable count of fields (i.e. someOf)
- I want continuous fields (i.e. hue between 56 and 70)
- I want discrete numeric fields (i.e. 2d6)

As someone who uses the grammar to generate content:
- I want to hit a button and get the entire tree
- I want to hit a button and get the top level fields, then manually expand the rest of the tree
- I want to use a 'seed' to guarantee consistent results across multiple re-builds
- I want to re-roll a specific field (this will invalidate the seed)
- I want to be able to download and view in a convenient format

As someone who uses this as a library:
- I want to be able to use either a file system or a database as the underlying storage mechanism
- I want to be able to plugin my own operations (think graph-expand) that utilize the grammar language
- I want it to be isolatend and parallelizable so that I can run multiple queries at once