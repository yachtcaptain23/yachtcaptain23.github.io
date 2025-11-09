import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../lib/posts';
import { getNotionPosts } from '../lib/notion';
import Link from 'next/link';
import Date from '../components/date';

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  const allNotionData = getNotionPosts();
  return {
    props: {
      allPostsData,
      allNotionData
    },
  };
}

export default function Home({ allPostsData}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>
          Welcome! 
        </p>
        <p> 
          I'm a Xoogler, ex-Brave, ex-Soothe, and former Amazonian. I have industry experience in Android apps and OS, Chromium browser, building backends for millions of users, delighting with frontend websites, and convincing skeptic coworkers with data analytics. 
        </p>
        <p>
          I'm well-versed in Java, Kotlin, Python, and Ruby and have additional professional experience working in Javascript, Golang, and C++. 
        </p>
        <p>
          When I'm not working, I like rowing, lifting, and reading textbooks and fiction.
        </p>
        <p>
          I hold Master's and Bachelor's of Electrical and Computer Engineering degrees from Carnegie Mellon University.
        </p>
        <p>
          My avatar is AI-generated from a prompt about my Papillon, Lafiel, playing one of my favorite games, hold-em Texas poker. 
        </p>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Projects</h2>
        <ul className={utilStyles.list}>
          {allPostsData.filter(item => item.post_type == 'project' && item.visible == 'true').map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
            <Link href={`/posts/${id}`}>{title}</Link>
            <br />
            <small className={utilStyles.lightText}>
              <Date dateString={date} />
            </small>
          </li>
          ))}
        </ul>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Writings</h2>
        <ul className={utilStyles.list}>
          {allNotionData.filter(item => item.post_type == 'writing' && item.visible == 'true').map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
            <Link href={`/posts/${id}`}>{title}</Link>
            <br />
            <small className={utilStyles.lightText}>
              <Date dateString={date} />
            </small>
          </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
