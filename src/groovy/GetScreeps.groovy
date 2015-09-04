@Grapes(
        @Grab(group='org.codehaus.groovy.modules.http-builder', module='http-builder', version='0.7.1')
)

import groovyx.net.http.HTTPBuilder
import static groovyx.net.http.Method.GET
import static groovyx.net.http.ContentType.TEXT
import groovy.json.JsonSlurper

def props = new Properties()
def resourceAsStream = getClass().getClassLoader().getResourceAsStream("screeps.properties")
props.load(resourceAsStream)
def username = props.username;
def password = props.password;
resourceAsStream.close()

def http = new HTTPBuilder('https://screeps.com')
def json = http.request(GET,TEXT) { req ->
    uri.path = "/api/user/code"
    headers['Authorization'] = 'Basic ' + "${username}:${password}".getBytes('iso-8859-1').encodeBase64()
    headers['Accept'] = 'application/json'
    response.success = { resp, reader ->
        return reader.getText()
    }
}

println "Got result from creeps: ${json}"

def parser = new JsonSlurper().parse(new StringReader(json));
parser.modules.each{k,v ->
    println "found file ${k}.js"
    new File("../screeps/${k}.js").withWriter { out ->
        out.println v
    }
}

