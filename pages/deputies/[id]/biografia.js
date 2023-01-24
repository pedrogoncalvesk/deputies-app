import Head from 'next/head';
import { load } from 'cheerio';
import axios from 'axios';
import Link from 'next/link'
import {
  Stack,
  Container,
  Typography,
} from '@mui/material';

import SimpleLayout from '../../../layouts/simple';

export default function DeputyBioPage({ id, name, data, lastScraped }) {
  const ref = `https://www.camara.leg.br/deputados/${id}/biografia`;
  return (
    <SimpleLayout>
      <Head>
        <title> Biografia de {name} </title>
        <link rel="stylesheet" as="style" href="https://www.camara.leg.br/tema/global/vendor-bundle.css"></link>
        <link rel="stylesheet" as="style" href="https://www.camara.leg.br/tema/global/camara-custom.css"></link>
        <link rel="stylesheet" href="https://www.camara.leg.br/tema/deputados/deputado.css"></link>
      </Head>

      <Container sx={{ paddingTop: 15 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography gutterBottom>
            Contéudo extraído às <strong>&quot;{lastScraped}&quot;</strong> originalmente da página: <Link element="a" href={ref} target="_blank">{ref}</Link>
          </Typography>

        </Stack>
      </Container>
      <div dangerouslySetInnerHTML={{ __html: data }} />
    </SimpleLayout>
  );
}

export async function getServerSideProps({ query }) {
  const { data } = await axios.get(`https://www.camara.leg.br/deputados/${query.id}/biografia`)
  const $ = load(data)

  const name = $('#nomedeputado').text()

  const container = $('.container-blocos-deputado').html()
  const lastScraped = new Date().toISOString()
  return {
    props: { id: query.id, name, data: container, lastScraped },
  }
}
