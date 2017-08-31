Baptz
=====

CLI utility that helps construct names adhering to naming conventions.

### Installation
<a name="installation"></a>

``` shell
npm install -g baptz
```

You will also need to install a naming convention configuration by doing `baptz add` and
supplying a URL to the configuration. As such, the naming convention can be hosted externally
(e.g. in a git repo).

### Usage
<a name="installation"></a>

``` shell
$ baptz --help

  Usage: baptz [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    run         construct a name based on the current active naming 
                convention - default if no command specified
    add         add a new naming convention
    update      reload naming convention(s)
    nc          set naming convention to use (if multiple available)
    help [cmd]  display help for [cmd]

  Active naming convention: my-aws-naming-convention
```


## Naming conventions

_Naming conventions_ are json configuration files consisting of templates and questions. Examples say more than 1000 words:

``` json
{
  "name": "my-aws-naming-convention",
  "resources": [
    {
      "name": "EC2::Subnet",
      "template": "sn-{regionCode}{az}-{vpcName}"
    },
    {
      "name": "EC2::VPC",
      "template": "vpc-{regionCode}-{descriptiveName}"
    },
    {
      "name": "S3::Bucket",
      "template": "hf-s3-{regionCode}-{envCode}-{descriptiveName}-{f:randomDigits(12)}"
    }
  ],
  "questions": [
    {
      "name": "regionCode",
      "message": "Region?",
      "type": "list",
      "choices": [
        {
          "name": "eu-west-1 (Ireland)",
          "value": "ew1",
          "short": "ew1"
        },
        {
          "name": "eu-west-2 (London)",
          "value": "ew2",
          "short": "ew2"
        },
        {
          "name": "eu-central-1 (Frankfurt)",
          "value": "ec1",
          "short": "ec1"
        }
      ],
      "default": "ew1"
    },
    {
      "name": "availabilityZone",
      "message": "Availability Zone?",
      "type": "list",
      "choices": [
        "a",
        "b",
        "c"
      ]
    },
    {
      "name": "envCode",
      "message": "Environment?",
      "type": "list",
      "choices": [
        {
          "name": "Production",
          "value": "p"
        },
        {
          "name": "Staging",
          "value": "s"
        },
        {
          "name": "Development",
          "value": "d"
        }
      ]
    },
    {
      "name": "descriptiveName",
      "message": "Descriptive name:",
      "type": "input"
    }
  ]
}
```

### Config location

Baptz configuration is stored at `<USER_HOME>/.config/configstore/baptz.json`

### Resources

A naming convention resource is described by a name and a template. Templates contain
placeholders (enclosed by braces, {}). Placeholders point at questions (which are defined
in the `questions` array of the config file). When running baptz for a given template,
the placeholders will be populated by the answers to the questions associated with the
placeholder.

If a placeholder references a question that is not defined in the `questions`
array, the an "input type" question will be constructed automatically based on the name.

### Questions

Defines questions according to https://www.npmjs.com/package/inquirer#questions

### Generator functions

Placeholders can reference "generator" functions. These are
prefixed with `f:`, such as `f:randomDigits(12)`. When running baptz, these
placeholders will be subsituted with the result of such a generator function.
The following generator functions are available:

| Generator      | Params        | Example            | Description   |
| -------------: | -------------:| ------------------:| -------------:|
| randomDigits   |  size (int)   | f:randomDigits(12) | Returns a random string of digits of specified length |        





### Source
[Github](https://github.com/kschulst/baptz)


## Support (OS Terminals)
<a name="support"></a>

Baptz is based on Inquirer.js, thus you should expect mostly good support for the CLIs below:

- **Mac OS**:
  - Terminal.app
  - iTerm
- **Windows**:
  - [ConEmu](https://conemu.github.io/)
  - cmd.exe
  - Powershell
  - Cygwin
- **Linux (Ubuntu, openSUSE, Arch Linux, etc)**:
  - gnome-terminal (Terminal GNOME)
  - konsole


## License
<a name="license"></a>

Licensed under the MIT license.
