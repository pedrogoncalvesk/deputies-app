import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  LinearProgress,
} from '@mui/material';

import DefaultLayout from '../layouts/default';
import Label from '../components/label';
import { ListHead, ListToolbar } from '../sections/default';

const TABLE_HEAD = [
  { id: 'nome', label: 'Nome', alignRight: false, canSort: true },
  { id: 'siglaPartido', label: 'Partido', alignRight: false, canSort: true },
  { id: 'siglaUF', label: 'Estado', alignRight: false, canSort: true },
  { id: 'school', label: 'Escolaridade', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
];

function debounce(cb, delay = 250) {
  let timeout

  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}

export default function DefaultPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('nome');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) {
      const query = new URLSearchParams({
        idLegislatura: 56,
        pagina: page + 1,
        itens: rowsPerPage,
        ordem: order,
        ordenarPor: orderBy,
        nome: filterName,
      });
      fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados?${query.toString()}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(
              `Status error: ${res.status}`
            );
          }
          const xCountTotal = res.headers.get('x-total-count');
          setTotal(!Number.isNaN(parseInt(xCountTotal, 10)) ? parseInt(xCountTotal, 10) : 0);
          return res.json()
        })
        .then(json => Promise.all(json?.dados?.map(async data => {
          const res = await (
            await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${data.id}`)
          ).json()
          return {
            id: data.id,
            avatarUrl: data.urlFoto,
            name: data.nome,
            politicalParty: data.siglaPartido,
            school: res.dados.escolaridade,
            status: res.dados.ultimoStatus.situacao,
            state: data.siglaUf,
          }
        })))
        .then(mappedRows => setRows(mappedRows))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [loading, error, filterName, order, orderBy, page, rowsPerPage]);

  const handleRequestSort = debounce((_, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setLoading(true);
  });

  const handleChangePage = debounce((_, newPage) => {
    setPage(newPage);
    setLoading(true);
  });

  const handleChangeRowsPerPage = debounce(event => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    setLoading(true);
  });

  const handleFilterByName = debounce(event => {
    setPage(0)
    setFilterName(event.target.value)
    setLoading(true);
  }, 500)

  const handleRowClick = id => {
    return router.push(`/deputies/${id}`)
  }

  return (
    <DefaultLayout>
      <Head>
        <title> Lista de Deputados Federais </title>
      </Head>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Deputados federais da 56ª legislatura
          </Typography>
        </Stack>

        <Card>
          <ListToolbar
            onFilterName={handleFilterByName}
            placeholder="Procure pelo nome do deputado..."
          />
          {loading ? <LinearProgress /> : null}

          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <ListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {loading && !rows.length && error === null ? (
                  <TableRow style={{ height: 53 * rowsPerPage }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                ) : !loading && !rows.length && error !== null ? (
                  <TableRow>
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                      <Paper
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h6" paragraph>
                          Serviço indisponível
                        </Typography>

                        <Typography variant="body2">
                          O serviço https://dadosabertos.camara.leg.br/ respondeu &nbsp;
                          <strong>&quot;{error}&quot;</strong>.
                          <br /> Tente pesquisar por outro termo, recarregue a página ou tente novamente mais tarde.
                        </Typography>
                      </Paper>
                    </TableCell>
                  </TableRow>
                ) : !loading && !rows.length ? (
                  <TableRow>
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                      <Paper
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h6" paragraph>
                          Não encontrado
                        </Typography>

                        <Typography variant="body2">
                          Resultados não encontrados para &nbsp;
                          <strong>&quot;{filterName}&quot;</strong>.
                          <br /> Tente verificar se há erros de digitação ou use palavras completas.
                        </Typography>
                      </Paper>
                    </TableCell>
                  </TableRow>
                ) : rows.map(({ id, name, state, status, politicalParty, avatarUrl, school }) => (
                  <TableRow
                    key={id}
                    hover
                    onClick={() => handleRowClick(id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar alt={name} src={avatarUrl} />
                        <Typography variant="subtitle2" noWrap>
                          {name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="left">{politicalParty}</TableCell>

                    <TableCell align="left">{state}</TableCell>

                    <TableCell align="left">{school}</TableCell>

                    <TableCell align="left">
                      <Label color={(status === 'Exercício' && 'success') || 'default'}>{status}</Label>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={total}
            labelRowsPerPage="Linhas por página"
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </DefaultLayout>
  );
}
