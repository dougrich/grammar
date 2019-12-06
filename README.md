# @dougrich/grammar

<a href="https://www.npmjs.com/package/@dougrich/grammar" alt="NPM"><img src="https://img.shields.io/npm/v/@dougrich/grammar" /></a>

<a href="https://github.com/dougrich/grammar" alt="Github"><img src="https://img.shields.io/github/last-commit/dougrich/grammar" /></a>

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Theoretical Structure

`is` and `has` structure.

An object `is` a set of hierarchical terms: for example, a male human name might be a `name/human/male`, while an english town might be a `name/town/english`. Asking for a `name` with no further hinting might result in either a male human name or an english town. This is an example: in a racially segregated fantasy world like Lord of the Rings, it might be better structured as `name/human/town`.

An object `has` a set of named fields. For example, a `town/english` might have the fields:
- Name, which is a `name/town/english`
- Mayor, which is a `person`
- Population, which is a `population/town`

# Operations

`generate` generates the entire tree - essentially a `generate` and a `hydrate`

# Contributing

Tests are critical. Write a test before you write a feature. Write a test after you write a feature. Write a test during the feature. Write lots of tests.

# Stories

As someone who authors content for the grammar:
- [ ] I want a simple authoring language
- [ ] I want it broken up into multiple files for legibility
- [ ] I want it to be easy to add or remove content from
- [x] I want discrete fields (i.e. oneOf)
- [x] I want variable count of fields (i.e. someOf)
- [ ] I want continuous fields (i.e. hue between 56 and 70)
- [x] I want discrete numeric fields (i.e. 2d6)

As someone who uses the grammar to generate content:
- [x] I want to hit a button and get the entire tree
- [x] I want to hit a button and get the top level fields, then manually expand the rest of the tree
- [x] I want to use a 'seed' to guarantee consistent results across multiple re-builds
- [x] I want to re-roll a specific field
- [ ] I want to be able to download and view in a convenient format

As someone who uses this as a library:
- [x] I want to be able to use either a file system or a database as the underlying storage mechanism
- [ ] I want to be able to plugin my own operations (think graph-expand) that utilize the grammar language
- [x] I want it to be isolatend and parallelizable so that I can run multiple queries at once
- [ ] I want to be able to switch to a fully compiled language for performance, both as an execution engine and as a overall binary
- [ ] I want to be able to use references which are resolved just before execution without copying to minimize memory footprint and to enable external definitions to connect in