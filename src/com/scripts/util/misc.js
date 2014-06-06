$.int = function(i) {
    return java.lang.Integer(i);
};

$.say = function(s) {
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
