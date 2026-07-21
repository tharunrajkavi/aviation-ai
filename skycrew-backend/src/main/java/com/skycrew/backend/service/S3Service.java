package com.skycrew.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

@Service
public class S3Service {

    @Value("${aws.s3.bucket:skycrew-rosters-reports}")
    private String bucketName;

    /**
     * Uploads report content to the designated AWS S3 bucket.
     * 
     * In a production cloud deployment, this is implemented using the AWS S3 SDK:
     * <code>
     *   S3Client s3 = S3Client.builder().region(Region.US_EAST_1).build();
     *   PutObjectRequest request = PutObjectRequest.builder()
     *       .bucket(bucketName)
     *       .key("reports/" + fileName)
     *       .contentType("application/json")
     *       .build();
     *   s3.putObject(request, RequestBody.fromString(content));
     * </code>
     * 
     * For local development, this writes to a local filesystem simulation folder 
     * and returns the target S3 asset URL.
     */
    public String uploadReport(String fileName, String content) {
        try {
            File dir = new File("local-s3-mock");
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            File file = new File(dir, fileName);
            try (FileWriter writer = new FileWriter(file)) {
                writer.write(content);
            }
            
            // Return public S3 URL placeholder
            return "https://" + bucketName + ".s3.amazonaws.com/reports/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("S3 Storage Mock Failure", e);
        }
    }
}
