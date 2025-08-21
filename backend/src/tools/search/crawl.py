import asyncio
from crawl4ai import *

async def crawl(link):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=link,
        )
        return result.markdown

async def crawl_links(links):
    data = []
    for link in links:
        markdown = await crawl(link)
        data.append(markdown)
    return data

# # Run a single crawl
# if __name__ == "__main__":
#     link = "http://jmc.stanford.edu/artificial-intelligence/what-is-ai/index.html"
#     result = asyncio.run(crawl(link))
#     print(result)
