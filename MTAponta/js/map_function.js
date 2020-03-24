var hist_loc = '';

function consultaDados(local, inscricao, matches){
    //var l = ol.proj.transform(local,'EPSG:3857', 'EPSG:31982')
    var num = matches[0].getProperties().f5==null?'S/N':matches[0].getProperties().f5;
    var cod_ocorrencia = matches[0].getProperties().f7==null?'-1':matches[0].getProperties().f7;
    var tip_ocorrencia = matches[0].getProperties().f6==null?'-1':matches[0].getProperties().f6;
    var ret = "{\"proprietario\":\""+matches[0].getProperties().f2+"\",\"inscricao\":\""+matches[0].getProperties().f1+"\",\"endereco\":\""+matches[0].getProperties().f4+", "+num+"\",\"compromissário\":\""+matches[0].getProperties().f3+"\",\"cod_ocorrencia\":"+cod_ocorrencia+",\"cod_tipo_ocorrencia\":"+tip_ocorrencia+",\"localizacao\":\["+local+"]\}";
    //console.log(ret);
    if(typeof JSInterface != "undefined")
        JSInterface.getInfo(ret);
}

function simulateEvent(type, x, y, opt_shiftKey) {
    var viewport = map.getViewport();
    // calculated in case body has top < 0 (test runner with small window)
    var position = viewport.getBoundingClientRect();
    var shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false;
    var event = new ol.pointer.PointerEvent(type, {
      clientX: position.left + x + width / 2,
      clientY: position.top + y + height / 2,
      shiftKey: shiftKey
    });
    map.handleMapBrowserEvent(new ol.MapBrowserPointerEvent(type, map, event));
}

function localizacao(center, zoom, inscricao ) { 
    map.getView().setCenter(center);
    map.getView().setZoom(zoom);
    vectorLayer.getSource().clear(); 
    if (zoom == '16') {
       point(ol.proj.transform(center,'EPSG:3857', 'EPSG:4326'));
    }
    if (inscricao){
        onClick({
            coordinate: center,
            map: map,
            pixel: [100,10],
            wasVirtual: true
        });
        loteVector.setStyle(loteVector.getStyle()); 
    }
    hist_loc = center;
    return center;
}

function point(center) {
    c = ol.proj.transform(center,'EPSG:4326', 'EPSG:3857');
    vectorLayer.getSource().clear(); 
    vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.Point(c)));
}

function alerta() {
    var ret = "{\"status\":\"OK\"}";
    if(typeof JSInterface != "undefined")
        JSInterface.setStatus(ret);
}

function desmarcaLote() {
    var ret = "{\"status\":\"OK\"}";
    limpaLotes();
    if(typeof JSInterface != "undefined")
        JSInterface.desmarcaLote(ret);
    
}

function limpaLotes() {
    loteVector.getSource().clear();
    if(map.getLayers().getLength() > 5)
        map.removeLayer(map.getLayers().getArray()[map.getLayers().getLength()-1]);
}

function copyStringToClipboard (str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}

//Habilitar/Desabilitar Ortofoto
function fn_ortofoto() {
    if (map.getLayers().getArray()[0].getVisible()) {
        document.getElementById('ortofoto').classList.remove("ativo");
        map.getLayers().getArray()[0].setVisible(false);
    } else {
        document.getElementById('ortofoto').classList.add("ativo");
        map.getLayers().getArray()[0].setVisible(true);
    }
    
}

function fn_lote() {
    if (map.getLayers().getArray()[1].getVisible()) {
        document.getElementById('layerLote').classList.remove("ativo");
        map.getLayers().getArray()[1].setVisible(false);
    } else {
        document.getElementById('layerLote').classList.add("ativo");
        map.getLayers().getArray()[1].setVisible(true);
    }
    
}

function fn_quadra() {
    if (map.getLayers().getArray()[2].getVisible()) {
        document.getElementById('layerQuadra').classList.remove("ativo");
        map.getLayers().getArray()[2].setVisible(false);
    } else {
        document.getElementById('layerQuadra').classList.add("ativo");
        map.getLayers().getArray()[2].setVisible(true);
    }
    
}

function retorno() {
    var centro = '';
    var data;
    
    $.ajax({
        url: urlBase + "/centro",
        type: "GET",
        dataType: "json",
        data: data,
        async: false,
        success: function(data){
            centro = data;
        }
    });
    return centro;
}

function center_map() {
    map.getView().setCenter(centroMapa);
    map.getView().setZoom(16);
    var features = hist_loc;
    if (features) {
        limpaLotes();
        hist_loc = '';
        return;
    }    
}

