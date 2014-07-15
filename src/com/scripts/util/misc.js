$.int = function(i) {
    return java.lang.Integer(i);
};

$.say = function(s) {
    var i = s.indexOf("<");
    
    while (i >= 0) {
        var s1 = "";
        var s2 = "";
        
        if (i > 0) {
            s1 = s.substring(0, i);
        }
        
        if (i < s.length) {
            s2 = s.substring(i + 1);
        }
        
        s = s1 + "< " + s2;
        
        i = s.indexOf("<", i + 1);
    }
    
    while (s.indexOf("<  ") >= 0) {
        s = s.replace('<  ', '< ');
    }
    
    $.ssay(s);
}; 

$.ssay = function(s) {
    var str = String(s);
    
    println(str);
    
    if ($.connected) {
        $.channel.say(str);
    }
}

$.list = { };
$.list.forEach = function(list, callback) {
    for(var i = 0; i < list.size(); i++) {
        callback(i, list.get(i));
    }
}

$.randElement = function(arr) {
    if (arr == null) return null;
    return arr[$.rand(arr.length)];
}

$.randRange = function (min, max) {
    return $.rand(max) + min;
}

$.rand = function (max) {
    return Math.abs($.random.nextInt()) % max;
}

$.array = { };
$.array.contains = function(arr, element) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] == element) return true;
    }
    return false;
}
