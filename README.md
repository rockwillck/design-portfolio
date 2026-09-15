---
id: "d9899ef4-433f-4345-8ce6-cffdaae6b7cd"
title: "Design Portfolio"
createdAt: "2026-09-15T20:45:57.939Z"
updatedAt: "2026-09-15T20:50:46.665Z"
version: 146
---
# Design Portfolio

## Updating Home Page Content

Update `index.html`. If you want to add a new section, add:

```
<div class="sect">
	<h2>Title Here</h2>
	<p>Content Here</p>
</div>
```

The sections will automatically alternate left/right alignment.

## Updating Project Gallery

Update `projects-data.json`. Add thumbnails and photos to `projects/imgs`, don't include `projects/imgs` in the path (that is, for `projects/imgs/IMG.png`, just write `IMG.png` to the JSON). Add step files to the `steps/` directory, don't include `steps/` or `.step` in the JSON (that is, for `steps/sample.step`, just write `sample`). For specifications, each item in the list will be presented as a bulleted list element.