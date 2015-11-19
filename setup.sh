#curl https://raw.githubusercontent.com/hl7-fhir/fhir-svn/master/source/fhirpath.g4 -o vendor/fhirpath.g4
#curl http://www.antlr.org/download/antlr-4.5.1-complete.jar -p antlr.jar
cd vendor
java -jar ../antlr.jar  -Dlanguage=JavaScript fhirpath.g4 -o ../generated
cd ..

