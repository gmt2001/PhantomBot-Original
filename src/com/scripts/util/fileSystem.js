/*
 * Usage: var array = $.readFile ("path/to/file.txt");
 * 
 * This function returns an array of strings, one per line of text in the file.
 * 
 */

$.readFile = function (path) {
    var lines = [];
    try {
        var fis = new java.io.FileInputStream (path);
        var scan = new java.util.Scanner (fis);
        for (var i = 0; scan.hasNextLine (); ++i) {
            lines [i] = scan.nextLine ();
        }
        fis.close ();
    } catch (e) {
        println ("Failed to open '" + path + "'");
    }
    return lines;
}

/*
 * Usage: $saveArray (["array", "of", "strings"], "path/to/file.txt")
 * 
 * This function writes an array of strings to a file, one per line
 * 
 */

$.saveArray = function (array, path) {
    try {
        var fos = new java.io.FileOutputStream (path);
        var ps = new java.io.PrintStream (fos);
        var l=array.length;
        for (var i=0; i<l; ++i) {
            ps.println (array [i]);
        }
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "'");
    }
}

$.writeToFile = function (string, path, append) {
    try {
        var fos = new java.io.FileOutputStream (path, append);
        var ps = new java.io.PrintStream (fos);
        ps.println (string);
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "'");
    }
}

$.touchFile = function (path) {
    try {
        var fos = new java.io.FileOutputStream (path, true);
        fos.close ();
    } catch (e) {
        println ("Failed to touch '" + path + "'");
    }
}


// Deprecated
$.printToFile = function (string, file) {
    println ("Warning '$.printToFile (string, file)' is deprecated, please use '$.writeToFile (string, file, append)'");
    $.saveArray ([string], file);
}

/*
setTimeout (function () {
        var arr = $.readFile ("test.txt");
        var l=arr.length;
        for (var i=0; i<l; ++i) {
                println (arr [i]);
        }
        $.saveArray (["line", " ", "more\ntext"], "out.txt");
        $.printToFile ("test string", "file1");
        $.printToFile ("test string\nnewline\n\n", "file2");
        $.printToFile (null, "file3");
}, 10000); */