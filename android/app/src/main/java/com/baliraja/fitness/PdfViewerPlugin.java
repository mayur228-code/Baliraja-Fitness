package com.baliraja.fitness;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "PdfViewer")
public class PdfViewerPlugin extends Plugin {

    @PluginMethod
    public void openPdf(PluginCall call) {
        String path = call.getString("path");
        String title = call.getString("title", "PDF उघडा (Open PDF)");

        if (path == null || path.trim().isEmpty()) {
            call.reject("Path is required to open PDF");
            return;
        }

        try {
            Uri contentUri;

            if (path.startsWith("content://")) {
                contentUri = Uri.parse(path);
            } else {
                String cleanPath = path;
                if (cleanPath.startsWith("file://")) {
                    cleanPath = Uri.parse(cleanPath).getPath();
                }

                if (cleanPath == null) {
                    call.reject("Invalid file path format: " + path);
                    return;
                }

                File file = new File(cleanPath);
                if (!file.exists()) {
                    call.reject("PDF file does not exist at: " + cleanPath);
                    return;
                }

                String authority = getContext().getPackageName() + ".fileprovider";
                contentUri = FileProvider.getUriForFile(getContext(), authority, file);
            }

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "application/pdf");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            Intent chooser = Intent.createChooser(intent, title);
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getActivity().startActivity(chooser);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("uri", contentUri.toString());
            call.resolve(ret);
        } catch (ActivityNotFoundException e) {
            call.reject("NO_PDF_VIEWER", "कोणतेही PDF व्ह्युअर ॲप सापडले नाही (No PDF viewer app found on device).", e);
        } catch (Exception e) {
            call.reject("PDF उघडताना त्रुटी आली: " + e.getMessage(), e);
        }
    }
}
