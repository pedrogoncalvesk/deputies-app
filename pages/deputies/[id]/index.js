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

export default function DeputyPage({ id, name, data, lastScraped }) {
  const ref = `https://www.camara.leg.br/deputados/${id}`;
  return (
    <SimpleLayout>
      <Head>
        <title> {name} </title>
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
      <div  dangerouslySetInnerHTML={{__html: data}} />
    </SimpleLayout>
  );
}

export async function getServerSideProps({ query }) {
  const params = query.ano ? `?ano=${query.ano}` : ''
  const { data } = await axios.get(`https://www.camara.leg.br/deputados/${query.id}${params}`)
  const $ = load(data)
  $('.atuacao__links-adicionais').remove()
  $('.icone-ajuda').remove()
  $('.veja-mais').remove()
  $('.exibir-todo-conteudo').remove()

  $('.deputado-links > li').each((index, element) => {
    if (index === 0) {
      const href = $(element).children('a').attr('href');
      $(element).children('a').attr('href', href.replace('https://www.camara.leg.br/deputados/', ''))
    } else {
      $(element).remove()
    }
  })

  $('.linha-tempo__item.js-timeline__item > a').each((index, element) => {
    const href = $(element).attr('href');
    $(element).attr('href', href.replace('https://www.camara.leg.br/deputados/', ''));
  })

  $('.atuacao__quantidade').each((_, element) => {
    const text = $(element).text()
    $(element).replaceWith(`<span class="atuacao__quantidade">${text}</span>`)
  })

  $('.list-table__heading').each((_, element) => {
    const text = $(element).text()
    $(element).replaceWith(`<span class="list-table__heading">${text}</span>`)
  })

  $('.beneficio__info').each((_, element) => {
    const text = $(element).text()
    $(element).replaceWith(`<span class="beneficio__info">${text}</span>`)
  })

  const name = $('#nomedeputado').text()

  const container = $('.container-blocos-deputado').html()
  const lastScraped = new Date().toLocaleString()
  return {
    props: { id: query.id, name, data: container, lastScraped },
  }
}
