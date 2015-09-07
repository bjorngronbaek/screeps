import groovy.io.FileType
import groovy.json.JsonBuilder
import groovyx.net.http.HTTPBuilder
import static groovyx.net.http.Method.POST
import static groovyx.net.http.ContentType.JSON


def props = new Properties()
def resourceAsStream = getClass().getClassLoader().getResourceAsStream("screeps.properties")
props.load(resourceAsStream)
def username = props.username;
def password = props.password;
resourceAsStream.close()

def data = [branch  : "test1", modules : new HashMap<String,String>()]

def list = []
def dir = new File("../screeps")
dir.eachFile (FileType.FILES) { file ->
    list << file
}

list.each {
    def file = new File("${it}")
    String fileContents = file.text
    data.modules.put(file.name.lastIndexOf('.').with {it != -1 ? file.name[0..<it] : file.name},fileContents)
}

println new JsonBuilder(data).toPrettyString()

def http = new HTTPBuilder('https://screeps.com')
http.request( POST, JSON ) { req ->
    uri.path = "/api/user/code"
    headers['Authorization'] = 'Basic ' + "${username}:${password}".getBytes('iso-8859-1').encodeBase64()
    body = data

    response.success = { resp, json ->
        println "success ${resp.statusLine}"
        println "response was ${json}"
    }
}