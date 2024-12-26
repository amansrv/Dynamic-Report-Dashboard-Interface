export const groupReportsByDate = (files) => {
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

export const groupReportsByTags = (files) => {
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
