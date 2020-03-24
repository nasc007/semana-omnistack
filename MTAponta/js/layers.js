var urlOrtofoto = 'http://ortofoto.microtontec.com.br/ortofoto.php?&folder=output&z={z}&x={x}&y={-y}';
var urlBase = 'http://ocorrencia.microtontec.com.br';
var urlLote = urlBase + '/lote';
var urlVia = urlBase + "/logradouro?&z={z}&x={x}&y={y}";
var centroMapa = retorno();
var idProp = "dsc_inscricao";
var linhaReta = '';
vectorTile =  new ol.source.Vector();

proj4.defs("EPSG:31982","+proj=utm +zone=22 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
ol.proj.proj4.register(proj4)

document.addEventListener('DOMContentLoaded', function() {
    alerta();
}, false);

var projection = new ol.proj.Projection({
    code:"EPSG:3857" ,
    units: "m",
    axisOrientation: "neu",
    global: true
});

function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for( i = 0; i < queries.length; i++ ) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

var circleOfiline = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function(feature){
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(200, 100, 0)'
            }),
            fill: new ol.style.Stroke({
                width: 2,
                color: 'rgba(200, 100, 0, 0.25)'
            })
        })
    }
});

var positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 2,
        fill: new ol.style.Fill({
            color: 'rgba(204, 20, 20)'
        }),
        stroke: new ol.style.Stroke({
            color: '#CC1414',
            width: 10
        })
    }),
}));

var vectorSource = new ol.source.Vector({
    features: [positionFeature]
});

vectorLayer = new ol.layer.Vector({
    source: vectorSource
});

var view = new ol.View({
    center: centroMapa,
    attributions: false,
    zoom: 16,
    maxZoom: 20,
    enableRotation: false,
    constrainOnlyCenter: true
});

var ortofoto = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: urlOrtofoto,
    }),
    maxZoom: 20,
    minZoom: 17
})

var loteVector = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: function(feature, res) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(200, 200, 0)'
            }),
            fill: new ol.style.Stroke({
                width: 2,
                color: 'rgba(200, 200, 0, 0.25)'
            })
        })
    }
});
var selection = {};

var mySource = new ol.source.VectorTile({
    format: new ol.format.MVT(),
    url: urlVia,
    crossOrigin: 'anonymous'
});

var via = new ol.layer.VectorTile({
    source: mySource,
    maxZoom: 20,
    minZoom: 17,
    style: function(feature) {
        return new ol.style.Style({
            /*fill: new ol.style.Fill({
              color: 'rgba(0, 0, 0)',
            }),
            stroke: new ol.style.Stroke({
                color: '#413B36',
                width: 8
            }),*/
            text: new ol.style.Text({
                stroke: new ol.style.Stroke({
                    width: 1,
                    color: 'rgb(0, 0, 0)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgb(255, 255, 255)'
                }),
                font:"bold 11px/1 Arial",
                placement:'line',
                maxAngle: 6.283185307179586,
                text: feature.get('denominaca')
            })
        });
    },
    minResolution: 0.01,
    maxResolution: 1
});

/***** Criando linha entre dois posntos ******/


//vectorLinha.setVisible(false);
function linha_reta(start, end) {
    
    if(map.getLayers().getLength() > 5)
        map.removeLayer(map.getLayers().getArray()[map.getLayers().getLength()-1]);
        
    var sourceLinha = new ol.source.Vector();
    sourceLinha.addFeature(new ol.Feature({
        geometry : new ol.geom.LineString([start,end]),
        text : Math.floor(Math.sqrt((end[0]-start[0])*(end[0]-start[0])+(end[1]-start[1])*(end[1]-start[1])))
    }));

    var styleFunctionLinha = function(feature) {
    var geometry = feature.getGeometry();
    var styles = [
        // linestring
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            text: new ol.style.Text({
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgb(0, 0, 0)'
                }),
                fill: new ol.style.Fill({
                    color: '#F4B813'
                }),
                font:"bold 20px/1 Arial",
                placement:'line',
                maxAngle: 6.283185307179586,
                textBaseline: 'bottom',
                text: feature.get('text').toString() + "m"
            })
        })
    ];

    geometry.forEachSegment(function(start, end) {
        var dx = end[0] - start[0];
        var dy = end[1] - start[1];
        var rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(new ol.style.Style({
        geometry: new ol.geom.Point(end),
        image: new ol.style.Icon({
            src: 'img/arrow.png',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -rotation
        })
        }));
    });
    return styles;
    };
    vectorLinha = new ol.layer.Vector({
        source: sourceLinha,
        style: styleFunctionLinha
    });

    //return vectorLinha;
    const extent = sourceLinha.getFeatures()[0].getGeometry().getExtent();
    extent[0] -= 100;
    extent[1] -= 100;
    extent[2] += 100;
    extent[3] += 100;

    map.getView().fit(extent);
    map.addLayer(vectorLinha);
    //vectorLinha.setVisible(true);
    
}


/***** Carrega mapa e layers *****/
var map = new ol.Map({
    
    layers: [      
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            maxZoom: 19
        }),
        ortofoto,
        vectorLayer,
        via,
        //circleOfiline,
        loteVector,
        //vectorLinha,
        
    ],
    target: "map",
    view: view,
});


map.on('rendercomplete', e => {
    if(typeof JSInterface != "undefined")
        JSInterface.mapacarregado('Ok');
})

var selectElement = document.getElementById('type');

var onClick = function(event) {
    var request = new XMLHttpRequest();
    request.open('POST', urlLote, true);
    limpaLotes();
    var p = event.coordinate;
    var formData = new FormData(); 
    formData.append("lat", event.coordinate[0]);
    formData.append( "long",event.coordinate[1]);
    request.responseType = 'json';    
    request.send(formData);
    
    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE) {
            //console.log(request.response);
            var matches = request.response.status == 'error'?desmarcaLote():new ol.format.GeoJSON().readFeatures(request.response);
            loteVector.getSource().clear();
            var features = request.response.status == 'error'?desmarcaLote():new ol.format.GeoJSON().readFeatures(request.response);

            var feature = features===undefined?undefined:features[0];
            //var fid = feature===undefined?undefined:feature.get(idProp);
            circleOfiline.getSource().clear();
            if (!features) {
                
                circleOfiline.getSource().addFeature(new ol.Feature(new ol.geom.Circle(event.coordinate, 10)));
                circleOfiline.setStyle(circleOfiline.getStyle());
                return;
            }
            vectorTile.addFeatures(features);
            copyStringToClipboard(features[0].getProperties().f1);
            hist_loc = features[0].getProperties().f1;
            //var p = ol.proj.transform(view.getProperties().center,'EPSG:3857','EPSG:31982')
            var i = features[0].getProperties().f2;
            consultaDados(p,i, matches);

            loteVector.getSource().addFeatures(features); 
            
            //selection = {};
            // add selected feature to lookup
            //selection[fid] = feature;
            
            //redraw
            loteVector.setStyle(loteVector.getStyle());
        }
    }
};


map.on('click', onClick);