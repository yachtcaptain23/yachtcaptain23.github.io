import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import { getAllNotionPostIds, getNotionPostContent } from '../../lib/notion';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

export async function getStaticProps({ params }) {
  // Try to get markdown post first
  try {
    const postData = await getPostData(params.id);
    return {
      props: {
        postData,
      },
    };
  } catch (error) {
    // If markdown fails, try Notion
    try {
      const notionData = await getNotionPostContent(params.id);
      // Get metadata from the list (we need title and date)
      const { getNotionPosts } = require('../../lib/notion');
      const allPosts = await getNotionPosts();
      const postMeta = allPosts.find(post => post.id === params.id);
      
      return {
        props: {
          postData: {
            id: notionData.id,
            title: postMeta?.title || 'Untitled',
            date: postMeta?.date || '',
            contentHtml: notionData.contentHtml,
          },
        },
      };
    } catch (notionError) {
      console.error('Error fetching post:', error, notionError);
      return {
        notFound: true,
      };
    }
  }
}

export async function getStaticPaths() {
  const markdownPaths = getAllPostIds();
  const notionPaths = await getAllNotionPostIds();
  
  return {
    paths: [...markdownPaths, ...notionPaths],
    fallback: false,
  };
}

export default function Post({ postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}
