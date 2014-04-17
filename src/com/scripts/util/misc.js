$.int = function(i) {
    return java.lang.Integer(i);
};

var lastSay = 0;

$.say = function(s) {
    str = String (s);
    println (str);
    $.channel.say(str);
    return s;
}; 

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

$.rand = function (max) {
    return Math.abs($.random.nextInt()) % max;
}

$.rand = function (min, max) {
    return $.rand(max) + min;
}

$.array = { };
$.array.contains = function(arr, element) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] == element) return true;
    }
    return false;
}
