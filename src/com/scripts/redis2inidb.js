println("Start redis2inidb...");

var keys = $.db.getKeys("*");

java.lang.System.out.print("   0/" + tostring(keys.length));

for(i = 0; i < keys.length; i++){
    var s = keys[i].split("_");
    
    $.inidb.set(s[1], s[2], $.db.get(s[1], s[2]));
    
    java.lang.System.out.print("\r   " + i + "/" + tostring(keys.length));
}

println();

println("   Saving...");

$.inidb.SaveAll(true);

println("End redis2inidb...");