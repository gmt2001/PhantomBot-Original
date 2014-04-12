package me.mast3rplan.phantombot.store;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import org.apache.commons.io.FileUtils;

/**
 *
 * @author gmt2001
 */
public class IniStore
{

    private HashMap<String, IniFile> files = new HashMap<>();
    private static final IniStore instance = new IniStore();

    public static IniStore instance()
    {
        return instance;
    }

    private boolean LoadFile(String fName, boolean force)
    {
        if (!files.containsKey(fName) || force)
        {
            try
            {
                String data = FileUtils.readFileToString(new File("./inistore/" + fName + ".ini"));
                String[] lines = data.replaceAll("\\r", "").split("\\n");

                IniFile f = new IniFile();

                String section = "";

                for (int i = 0; i < lines.length; i++)
                {
                    if (!lines[i].trim().startsWith(";"))
                    {
                        if (lines[i].trim().startsWith("[") && lines[i].trim().endsWith("]"))
                        {
                            section = lines[i].trim().substring(1, lines[i].trim().length() - 2);
                            f.data.put(section, new HashMap<String, String>());
                        } else if (!lines[i].trim().isEmpty())
                        {
                            String[] spl = lines[i].split("=", 2);
                            f.data.get(section).put(spl[0], spl[1]);
                        }
                    }
                }

                files.put(fName, f);
            } catch (IOException ex)
            {
                return false;
            }
        }

        return true;
    }

    private void SaveFile(String fName, IniFile data)
    {
        try
        {
            String wdata = "";
            String[] adata = (String[]) data.data.keySet().toArray();
            String[] akdata;
            String[] avdata;

            for (int i = 0; i < adata.length; i++)
            {
                if (i > 0)
                {
                    wdata += "\n";
                }

                if (!adata[i].equals(""))
                {
                    wdata += "[" + adata[i] + "]\n";
                }

                akdata = (String[]) data.data.get(adata[i]).keySet().toArray();
                avdata = (String[]) data.data.get(adata[i]).values().toArray();

                for (int b = 0; b < akdata.length; b++)
                {
                    wdata += akdata[b] + "=" + avdata[b] + "\n";
                }
            }

            FileUtils.writeStringToFile(new File("./inistore/" + fName + ".ini"), wdata);
        } catch (IOException ex)
        {
        }
    }

    private static class IniFile
    {

        protected HashMap<String, HashMap<String, String>> data = new HashMap<>();
    }

    public void ReloadFile(String fName)
    {
        LoadFile(fName, true);
    }

    public String[] GetCategoryList(String fName)
    {
        if (!LoadFile(fName, false))
        {
            return new String[]
                    {
                    };
        }

        return (String[]) files.get(fName).data.keySet().toArray();
    }

    public String[] GetKeyList(String fName, String section)
    {
        if (!LoadFile(fName, false))
        {
            return new String[]
                    {
                    };
        }

        return (String[]) files.get(fName).data.get(section).keySet().toArray();
    }

    public String GetString(String fName, String section, String key)
    {
        if (!LoadFile(fName, false))
        {
            return "";
        }

        if (key.startsWith(";") || key.startsWith("["))
        {
            key = "_" + key;
        }

        return (String) files.get(fName).data.get(section).get(key);
    }

    public void SetString(String fName, String section, String key, String value)
    {
        LoadFile(fName, false);

        if (key.startsWith(";") || key.startsWith("["))
        {
            key = "_" + key;
        }

        files.get(fName).data.get(section).put(key, value);

        SaveFile(fName, files.get(fName));
    }

    public int GetInteger(String fName, String section, String key)
    {
        String sval = GetString(fName, section, key);

        try
        {
            return Integer.parseInt(sval);
        } catch (NumberFormatException ex)
        {
            return -1;
        }
    }

    public void SetInteger(String fName, String section, String key, int value)
    {
        String sval = Integer.toString(value);

        SetString(fName, section, key, sval);
    }

    public float GetFloat(String fName, String section, String key)
    {
        String sval = GetString(fName, section, key);

        try
        {
            return Float.parseFloat(sval);
        } catch (NumberFormatException ex)
        {
            return -1.0f;
        }
    }

    public void SetFloat(String fName, String section, String key, float value)
    {
        String sval = Float.toString(value);

        SetString(fName, section, key, sval);
    }

    public double GetDouble(String fName, String section, String key)
    {
        String sval = GetString(fName, section, key);

        try
        {
            return Double.parseDouble(sval);
        } catch (NumberFormatException ex)
        {
            return -1.0;
        }
    }

    public void SetDouble(String fName, String section, String key, double value)
    {
        String sval = Double.toString(value);

        SetString(fName, section, key, sval);
    }

    public boolean GetBoolean(String fName, String section, String key)
    {
        int ival = GetInteger(fName, section, key);

        return ival == 1;
    }

    public void SetBoolean(String fName, String section, String key, boolean value)
    {
        int ival = 0;

        if (value)
        {
            ival = 1;
        }

        SetInteger(fName, section, key, ival);
    }
}
