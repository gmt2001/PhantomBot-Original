$.readFile = function(path) {
    var lines = [];
    
    try {
        var fis = new java.io.FileInputStream (path);
        var scan = new java.util.Scanner (fis);
        for (var i = 0; scan.hasNextLine (); ++i) {
            lines [i] = scan.nextLine ();
        }
        fis.close ();
    } catch (e) {
        println ("Failed to open '" + path + "': " + e);
    }
    
    return lines;
}

$.saveArray = function(array, path, append) {
    try {
        var fos = new java.io.FileOutputStream (path, append);
        var ps = new java.io.PrintStream (fos);
        var l=array.length;
        for (var i=0; i<l; ++i) {
            ps.println (array [i]);
        }
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "': " + e);
    }
}

$.writeToFile = function(string, path, append) {
    try {
        var fos = new java.io.FileOutputStream (path, append);
        var ps = new java.io.PrintStream (fos);
        ps.println (string);
        fos.close ();
    } catch (e) {
        println ("Failed to write to '" + path + "': " + e);
    }
}

$.touchFile = function(path) {
    try {
        var fos = new java.io.FileOutputStream(path, true);
        fos.close ();
    } catch (e) {
        println ("Failed to touch '" + path + "': " + e);
    }
}

$.deleteFile = function(path) {
    try {
        var f = new java.io.File(path);
        f.deleteOnExit();
    } catch (e) {
        println("Failed to delete '" + path + "': " + e)
    }
}

$.fileExists = function(path) {
    try {
        var f = new java.io.File(path);
        return f.exists();
    } catch (e) {
        println("Failed to delete '" + path + "': " + e)
    }
    
    return false;
}