import React, { useRef, useState } from "react";
import Header from "../add-new-site/add-new-site-components/Header";
import exportFromJSON from "export-from-json";
import { useNavigate } from "react-router-dom";

function ExportImport() {
  const [fileName, setFileName] = useState(undefined);
  const [tokens, setTokens] = useState();
  const navigate = useNavigate()
  const handleExport = () => {
    const data = tokens;
    const fileName = "LMN Exported Data";
    const exportType = exportFromJSON.types.json;

    exportFromJSON({ data, fileName, exportType });
  };

  const handleImport = () => {
    const fileInput = fileInputRef.current;
    const selectedFile = fileInput.files[0];
    setFileName(selectedFile.name);
  
    if (fileInput.files.length === 0) {
      alert("Please select a JSON file to import.");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
  
        if (typeof jsonData === "object" && !Array.isArray(jsonData)) {
          const importedDataAdded = { ...tokens, ...jsonData };
          setTokens(importedDataAdded); // Update the state
          console.log("Imported JSON Data:", importedDataAdded);

          // eslint-disable-next-line no-undef
          chrome.storage.local.set({ loginMeNowTokens: importedDataAdded }, function () {
          // eslint-disable-next-line no-undef
            if (chrome.runtime.lastError) {
          // eslint-disable-next-line no-undef
              console.error('Error saving data to local storage:', chrome.runtime.lastError);
            } else {
              console.log('Data saved successfully: ', importedDataAdded);
              navigate("/", { state: { success: true } });
            }
          });
        } else {
          alert("JSON data is not an object.");
        }
      } catch (error) {
        alert("Error parsing JSON file: " + error.message);
      }
    };
  
    reader.readAsText(file);
  };

  const fileInputRef = useRef();

  const handleImportButtonClick = () => {
    fileInputRef.current.click();
  };

  // eslint-disable-next-line no-undef
  chrome.storage.local.get({ loginMeNowTokens: {} }, function (data) {
    let tokens = data.loginMeNowTokens ? data.loginMeNowTokens : {};
    setTokens(tokens);
  });
  return (
    <>
      <Header title="" />
      <div className="h-[528px] flex justify-center items-center flex-col">
        <p className="mb-8 font-medium text-[18px]">Import/Export saved login data</p>
        <button
          className="bg-[#073A2E] text-white text-[18px] py-2.5 px-10 mb-5 block rounded-[8px]"
          onClick={handleExport}
        >
          Export
        </button>

        <label
          htmlFor="fileInput"
          className="bg-[#1C8C60] text-white text-[18px] py-2.5 px-10 block rounded-[8px] cursor-pointer"
          onClick={handleImportButtonClick}
        >
          Import
        </label>
        <input
          className="hidden"
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImport}
        />
        <p className="mt-2">{fileName}</p>
      </div>
    </>
  );
}

export default ExportImport;