import React, { useState, useRef, useMemo } from "react";

import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Upload,
} from "lucide-react";

const GroupControls = ({ groupBy, onGroupByChange }) => (
  <div className="mb-6 flex items-center space-x-4">
    <label className="text-sm font-medium text-gray-700">Group by:</label>
    <select
      value={groupBy}
      onChange={(e) => onGroupByChange(e.target.value)}
      className="mt-1 block w-48 rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    >
      <option value="none">No Grouping</option>
      <option value="date">Date</option>
      <option value="tags">Tags</option>
    </select>
  </div>
);

const TagManager = ({ tags, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="ml-1 inline-flex items-center p-0.5 rounded-full hover:bg-blue-200"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <div className="flex items-center">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add tag..."
          className="text-sm border rounded px-2 py-1 w-24"
          onKeyPress={(e) => {
            if (e.key === "Enter" && newTag.trim()) {
              onAddTag(newTag.trim());
              setNewTag("");
            }
          }}
        />
        <button
          onClick={() => {
            if (newTag.trim()) {
              onAddTag(newTag.trim());
              setNewTag("");
            }
          }}
          className="ml-1 p-1 rounded hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Toggle = ({ isActive, onToggle }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={onToggle}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        ${isActive ? "bg-green-500" : "bg-gray-300"}
        transition-colors duration-200
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
          ${isActive ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
    <span
      className={`text-sm ${isActive ? "text-green-600" : "text-gray-500"}`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>
);

const CSVTable = ({ headers, data, initialPageSize = 20, initialPage = 1 }) => {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      headers.every((header, index) => {
        const filterValue = filters[header];
        return filterValue ? row[index] === filterValue : true;
      })
    );
  }, [data, filters, headers]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[headers.indexOf(sortConfig.key)];
      const bValue = b[headers.indexOf(sortConfig.key)];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig, headers]);

  // Pagination logic
  const startIndex = pageSize === "All" ? 0 : (currentPage - 1) * pageSize;
  const endIndex =
    pageSize === "All"
      ? sortedData.length
      : Math.min(startIndex + pageSize, sortedData.length);
  const currentData = sortedData.slice(startIndex, endIndex);

  const totalPages =
    pageSize === "All" ? 1 : Math.ceil(sortedData.length / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    const parsedPageSize =
      newPageSize === "All" ? "All" : parseInt(newPageSize, 10);
    setPageSize(parsedPageSize);
    setCurrentPage(1); // Reset to the first page
  };

  const handleFilterChange = (header, value) => {
    setFilters((prev) => ({
      ...prev,
      [header]: value || null, // Remove filter if value is empty
    }));
    setCurrentPage(1); // Reset to the first page
  };

  const handleSort = (header) => {
    setSortConfig((prev) => ({
      key: header,
      direction:
        prev.key === header && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    return headers.reduce((options, header, index) => {
      options[header] = Array.from(
        new Set(data.map((row) => row[index]))
      ).sort();
      return options;
    }, {});
  }, [data, headers]);

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex flex-col">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort(header)}
                    >
                      <span>{header}</span>
                      <span className="ml-1">
                        {sortConfig.key === header ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronUp className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    </div>
                    <select
                      className="mt-1 text-xs"
                      onChange={(e) =>
                        handleFilterChange(header, e.target.value)
                      }
                      value={filters[header] || ""}
                    >
                      <option value="">All</option>
                      {filterOptions[header].map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalItems={sortedData.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

const GroupedReports = ({ group, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 mb-2 text-gray-700 hover:text-gray-900"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        <span className="font-medium">{group.title}</span>
        <span className="text-sm text-gray-500">({group.count} reports)</span>
      </button>
      {isExpanded && (
        <div className="pl-6 border-l-2 border-gray-200">{children}</div>
      )}
    </div>
  );
};

const DemoCSVViewer = () => {
  const [activeFiles, setActiveFiles] = useState([]);
  const [groupBy, setGroupBy] = useState("none");
  const fileInputRef = useRef(null);

  const parseCSV = (content) => {
    const lines = content.split("\n");
    const headers = lines[0].split(",").map((header) => header.trim());
    const data = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => line.split(",").map((cell) => cell.trim()));
    return { headers, data };
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                const content = e.target.result;
                const { headers, data } = parseCSV(content);

                resolve({
                  fileName: file.name,
                  uploadDate: new Date().toISOString(),
                  tags: [],
                  headers,
                  data,
                  isActive: true,
                });
              } catch (error) {
                reject(
                  new Error(`Error parsing ${file.name}: ${error.message}`)
                );
              }
            };

            reader.onerror = () =>
              reject(new Error(`Error reading ${file.name}`));
            reader.readAsText(file);
          });
        })
      );

      setActiveFiles((prev) => [...prev, ...processedFiles]);
    } catch (error) {
      console.error("Error processing CSV files:", error);
      alert(
        "Error processing CSV files. Please make sure they are valid CSV format."
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = (fileName, tag) => {
    setActiveFiles((prev) =>
      prev.map((file) => {
        if (file.fileName === fileName) {
          return {
            ...file,
            tags: [...(file.tags || []), tag],
          };
        }
        return file;
      })
    );
  };

  const handleRemoveTag = (fileName, tagToRemove) => {
    setActiveFiles((prev) =>
      prev.map((file) => {
        if (file.fileName === fileName) {
          return {
            ...file,
            tags: (file.tags || []).filter((tag) => tag !== tagToRemove),
          };
        }
        return file;
      })
    );
  };

  const toggleStatus = (fileName) => {
    setActiveFiles((prev) =>
      prev.map((file) =>
        file.fileName === fileName
          ? { ...file, isActive: !file.isActive }
          : file
      )
    );
  };

  const CSVReport = ({ file, onToggleStatus, showToggle = true }) => (
    <div className={`mb-6 ${!file.isActive && "opacity-75"}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">{file.fileName}</h3>
        {showToggle && (
          <Toggle
            isActive={file.isActive}
            onToggle={() => onToggleStatus(file.fileName)}
          />
        )}
      </div>
      <TagManager
        tags={file.tags}
        onAddTag={(tag) => handleAddTag(file.fileName, tag)}
        onRemoveTag={(tag) => handleRemoveTag(file.fileName, tag)}
      />
      <CSVTable headers={file.headers} data={file.data} />
    </div>
  );

  const InactiveReports = ({ files, onToggleStatus }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const inactiveFiles = files.filter((file) => !file.isActive);

    if (inactiveFiles.length === 0) return null;

    return (
      <div className="mt-8 border-t pt-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 mb-4 text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <span className="font-medium">Inactive Reports</span>
          <span className="text-sm text-gray-500">
            ({inactiveFiles.length} reports)
          </span>
        </button>
        {isExpanded && (
          <div className="space-y-6 pl-6 border-l-2 border-gray-200">
            {inactiveFiles.map((file) => (
              <CSVReport
                key={file.fileName}
                file={file}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const groupReportsByDate = (files) => {
    const groups = files.reduce((acc, file) => {
      const date = new Date(file.uploadDate);
      const dateKey = date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(file);
      return acc;
    }, {});

    return Object.entries(groups).map(([date, files]) => ({
      title: new Date(date).toLocaleDateString(),
      files,
      count: files.length,
    }));
  };

  const groupReportsByTags = (files) => {
    const groups = files.reduce((acc, file) => {
      const tags = file.tags.length > 0 ? file.tags : ["Untagged"];
      tags.forEach((tag) => {
        if (!acc[tag]) {
          acc[tag] = [];
        }
        acc[tag].push(file);
      });
      return acc;
    }, {});

    return Object.entries(groups).map(([tag, files]) => ({
      title: tag,
      files,
      count: files.length,
    }));
  };

  const getGroupedReports = () => {
    const activeOnlyFiles = activeFiles.filter((file) => file.isActive);

    switch (groupBy) {
      case "date":
        return groupReportsByDate(activeOnlyFiles);
      case "tags":
        return groupReportsByTags(activeOnlyFiles);
      default:
        return [
          {
            title: "All Reports",
            files: activeOnlyFiles,
            count: activeOnlyFiles.length,
          },
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dynamic Report Dashboard Interface</h1>
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            multiple
            className="hidden"
            id="csv-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </button>
        </div>

        <GroupControls groupBy={groupBy} onGroupByChange={setGroupBy} />

        {activeFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No CSV files uploaded yet. Click "Upload CSV" to get started.
          </div>
        ) : (
          <>
            {getGroupedReports().map((group, index) => (
              <GroupedReports key={index} group={group}>
                {group.files.map((file) => (
                  <CSVReport
                    key={file.fileName}
                    file={file}
                    onToggleStatus={toggleStatus}
                  />
                ))}
              </GroupedReports>
            ))}

            <InactiveReports
              files={activeFiles}
              onToggleStatus={toggleStatus}
            />
          </>
        )}
      </div>
    </div>
  );
};

const Pagination = ({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = pageSize === "All" ? 1 : Math.ceil(totalItems / pageSize);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {totalItems === 0
                ? 0
                : (currentPage - 1) *
                (pageSize === "All" ? totalItems : pageSize) +
                1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {pageSize === "All"
                ? totalItems
                : Math.min(currentPage * pageSize, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange(
                e.target.value === "All" ? "All" : Number(e.target.value)
              )
            }
            className="rounded-md border border-gray-300 py-1 px-2 text-sm"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={1000}>1000 per page</option>
            <option value="All">All</option>
          </select>

          {/* Navigation buttons */}
          <nav className="flex items-center space-x-2" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DemoCSVViewer;
