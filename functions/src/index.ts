import * as functions from "firebase-functions";
import * as firestore from "@google-cloud/firestore";

// export const helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

const client = new firestore.v1.FirestoreAdminClient();

// Replace BUCKET_NAME
const bucket = "gs://fs_backup_bucket";

exports.scheduledFirestoreExport = functions.pubsub
    .schedule('every 24 hours')
    // .schedule('every 2 minutes')
    .onRun((context) => {
        let projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName =
            client.databasePath(projectId as string, '(default)');

        return client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: []
        }).then((responses: any[]) => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        })
            .catch((err: any) => {
                console.error(err);
                throw new Error('Export operation failed');
            });
    });