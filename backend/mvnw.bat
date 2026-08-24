@echo off
if not defined JAVA_HOME (
    if exist "%USERPROFILE%\.jdks\temurin-21\bin\java.exe" set "JAVA_HOME=%USERPROFILE%\.jdks\temurin-21"
)
if not defined MAVEN_HOME (
    if exist "%USERPROFILE%\.maven\apache-maven-3.9.9\bin\mvn.cmd" set "MAVEN_HOME=%USERPROFILE%\.maven\apache-maven-3.9.9"
)
if defined MAVEN_HOME set "PATH=%MAVEN_HOME%\bin;%PATH%"
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

mvn %*

