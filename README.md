# What is it
This is a minecraft server launch kit based on [purpurmc](https://purpurmc.org/) and write on nodejs.
We have an interactive command line interface for many things.

# Requirements
It tested on nodejs v16.13.2, but must working at older too

| Purpur/Paper Release | Recommended Java Version |
|----------------------|--------------------------|
| 1.8 to 1.11          | Java 8                   |
| 1.12 to 1.16.4       | Java 11                  |
| 1.16.5 to 1.17.1     | Java 16                  |
| 1.18 and newer       | Java 17                  |

Look at the [Azul Zulu Builds of OpenJDK](https://www.azul.com/downloads/?package=jdk) for you Operating System, Architecture and Java Version.

You may also need the screen utility.
Example for debian-based: `sudo apt-get install screen -y`

# Installing
```
npm install
cp .env.example .env
```

# Download or update server
```
./main.js update
```

# Change the amount of memory allocated for Java
```
./main.js setmem
```
