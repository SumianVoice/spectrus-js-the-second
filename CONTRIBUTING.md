# Contributing

If you'd like to contribute, the best way to do this is to fork this repo, make your changes, and then do a pull request.

There are automated checks in place to ensure code quality. In particular, we use `eslint` to make sure style guidelines are met.

To lint your code before submitting a PR, install Node.js and NPM, and then run the following:

```sh
# get eslint
npm ci
# run eslint
npm run lint
```

You can replace `npm run lint` with `npm run fixlint` to fix as many mistakes as possible automagically:

```sh
# get eslint
npm ci
# run eslint and fix my code!
npm run fixlint
```