# LLMSheet

> A spreadsheet that fills itself.


## WIP

This is a WIP of a hackathon project. 


What's currently possible:
- Creating spreadsheets
- Creating columns with certain types and descriptions, that will be filled by LLMs
- (locally) uploading PDF files (with up to 20 pages) that are split into pages and passed to LLMs as images for extraction
- Streaming object responses to the table

Note:
- The code is not cleaned up – some things might be pretty hacky
- Currently Python is needed to split the uploaded PDFs into pages and convert those pages into images (couldn't find a stable way to do this with Node)
- All data is stored in the browser using IndexedDB
- WIP



## Running the project locally

1. Clone the repo
2. Run `pnpm i`
3. Create a python venv called `venv` in `apps/web` and install the packages `pdf2image` and `PyPDF2` and make sure [poppler](https://poppler.freedesktop.org/) is installed
4. Currently, `claude-3.5-sonnet` is used as LLM. Make sure `ANTHROPIC_API_KEY` is set in `apps/web/.env` 
5. Run the next project using `pnpm dev` or `pnpm build` & `pnpm start` 
