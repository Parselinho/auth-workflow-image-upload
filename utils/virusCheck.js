const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const debug = require("debug")("app:virusCheck");

async function uploadFileToVirusTotal(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  try {
    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
          ...formData.getHeaders(),
        },
      }
    );
    return response.data.data.id;
  } catch (error) {
    console.error("Error uploading file to VirusTotal:", error);
    throw error;
  }
}

async function getVirusTotalReport(fileId) {
  try {
    const result = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${fileId}`,
      {
        headers: {
          "x-apikey": process.env.VIRUS_TOTAL_API_KEY,
        },
      }
    );

    return result.data;
  } catch (error) {
    console.error("Error retrieving report from VirusTotal:", error);
    throw error;
  }
}

function reportContainsViruses(report) {
  if (!report || !report.data || !report.data.attributes) {
    throw new Error("Invalid report structure");
  }

  const stats = report.data.attributes.stats;
  debug("stats", stats);
  return (
    (stats.malicious && stats.malicious > 0) ||
    (stats.suspicious && stats.suspicious > 0)
  );
}

module.exports = {
  uploadFileToVirusTotal,
  getVirusTotalReport,
  reportContainsViruses,
};
