<h1>
  Check Version Action for GitHub <br>
  <a href="https://discord.gg/bSsv7XM"><img src="https://img.shields.io/badge/chat-discord-green?logo=discord&amp;style=flat" height="20"></a>
</h1>

Verifies that the version number (in a pull request) was bumped by comparing it
to the prevous version from the base branch.

<img src="https://user-images.githubusercontent.com/197134/78778381-d9dd2380-79a3-11ea-971b-e96d9111b1ea.png" width="565" height="267">

## Usage

See [`action.yaml`](action.yaml)

##### Basic

```yaml
name: api
on:
  pull_request:
    paths:
      - "api"
      - "!README.md"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: kriasoft/check-version@v1
        with: { path: "api" }
```

#### Full

```yaml
name: api
on:
  pull_request:
    paths:
      - "api"
      - "!README.md"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - id: pkg
        uses: kriasoft/check-version@v1
        with:
          path: "api"
          format: "{name}_v{version}+build.{pr_number}.zip"

      - run: |
          echo "name: ${{ steps.pkg.outputs.name }}"
          echo "version: ${{ steps.pkg.outputs.version }}"
          echo "release: ${{ steps.pkg.outputs.release }}"
        #
        # Prints:
        #   name: api
        #   version: 0.1.3
        #   release: api_v0.1.3+build.549.zip
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
