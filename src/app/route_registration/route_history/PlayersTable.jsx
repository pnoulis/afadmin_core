import * as React from "react";
import {
  Box,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  TablePagination,
} from "@mui/material";
import styled from "styled-components";

const StyleTableHeadRow = styled(TableRow)`
  th {
    font-family: Roboto-Bold;
    font-size: var(--tx-nl);
    color: var(--primary-base);
    letter-spacing: 1px;
    text-transform: capitalize;
  }

  .status {
    font-family: Roboto-Bold;
    font-size: var(--tx-md);
    color: var(--info-base);
  }

  .number {
    text-align: center;
  }
`;

const StyleTablePlayerRow = styled(TableRow)`
  td {
    font-family: Roboto-Regular;
    font-size: var(--tx-nl);
    letter-spacing: 1px;
    text-transform: capitalize;
  }

  .status {
    font-family: Roboto-Bold;
    font-size: var(--tx-nl);
    color: var(--info-base);
  }

  .number {
    font-size: var(--tx-md);
    font-family: Roboto-Bold;
    text-align: center;
  }
`;

function getPlayerStatus(player) {
  if (player.wristband?.active) {
    return "In game";
  }

  if (player.wristbandMerged) {
    return "Paired";
  }

  return "Registered";
}

function PlayersTableHeader() {
  return (
    <TableHead>
      <StyleTableHeadRow>
        <TableCell>username</TableCell>
        <TableCell>name</TableCell>
        <TableCell>surname</TableCell>
        <TableCell>email</TableCell>
        <TableCell className="number">wristband rfid</TableCell>
        <TableCell className="status">status</TableCell>
      </StyleTableHeadRow>
    </TableHead>
  );
}

function PlayersTable({ rows }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const handlePageChange = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  return (
    <Box key={rowsPerPage}>
      <Paper>
        <TableContainer sx={{ height: 500 }}>
          <Table>
            <PlayersTableHeader />
            <TableBody>
              {(rowsPerPage > 0
                ? rows.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : rows
              ).map((row) => (
                <StyleTablePlayerRow key={row.name}>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.surname}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell className="number">
                    {row.wristband?.wristbandNumber}
                  </TableCell>
                  <TableCell className="status">
                    {getPlayerStatus(row)}
                  </TableCell>
                </StyleTablePlayerRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          rows={rows}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[8, 10, 25]}
          page={page}
          labelDisplayedRows={({ page }) => {
            return `Page: ${page + 1}`;
          }}
          showFirstButton={true}
          showLastButton={true}
        />
      </Paper>
    </Box>
  );
}

export { PlayersTable };
