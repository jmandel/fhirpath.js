curl http://www.antlr.org/download/antlr-4.5.1-complete.jar -o antlr.jar
cd vendor
java -jar ../antlr.jar  -Dlanguage=JavaScript fhirpath.g4 -o ../generated
cd ..

