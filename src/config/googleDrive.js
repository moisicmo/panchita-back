const fs = require('fs');
const { google } = require('googleapis');

const apikeys = require('./super-balance-423213-50f4189fe824.json');
const SCOPE = ['https://www.googleapis.com/auth/drive'];


class GoogleDriveService {
  constructor() {
    this.driveClient = this.createDriveClient();
  }
  createDriveClient() {
    // const jwtClient = new google.auth.JWT(
    //   apikeys.client_email,
    //   null,
    //   apikeys.private_key,
    //   SCOPE
    // );
    // await jwtClient.authorize();
    // console.log('jwtClient', jwtClient);
    return google.drive({
      version: 'v3',
      auth: new google.auth.JWT(
        apikeys.client_email,
        null,
        apikeys.private_key,
        SCOPE
      )
    });
  }

  createFolder(folderName) {
    return this.driveClient.files.create({
      // resource: {
        //   name: folderName,
        //   mimeType: 'application/vnd.google-apps.folder',
        // },
        fields: 'id, name',
      });
    }

    searchFolder(folderName) {
      return new Promise((resolve, reject) => {
        this.driveClient.files.list(
          {
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
            fields: 'files(id, name)',
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            
            return resolve(res.data.files ? res.data.files[0] : null);
          },
        );
      });
    }
    
  saveFile(fileName, fileStream, fileMimeType, folderId) {
    var fileMetaData = {
      name:'mydrivetext.pdf',    
      parents:['1Gb4YD5Yik5zdmbcV-u0gzk3HWJhcujC7'] // A folder ID to which file will get uploaded
  }
    return this.driveClient.files.create({
      resource:fileMetaData,
      requestBody: {
        name: fileName,
        mimeType: fileMimeType,
        parents: folderId ? [folderId] : [],
      },
      media: {
        mimeType: fileMimeType,
        body: fileStream,
      },
    });
  }
  searchFile(fileId) {
    return this.driveClient.files.get({
      fileId: fileId,
      alt: 'media',
    });
  }
}

module.exports = { GoogleDriveService };
